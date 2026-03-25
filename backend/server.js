const express = require("express");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");

const db = require("./database");

const app = express();

app.use(cors());
app.use(bodyParser.json());

/*Cadastrar usuário*/

app.post("/register", async (req,res)=>{

    const {nome,email,senha} = req.body;

    if(!nome || !email || !senha){
        return res.status(400).json({
            erro:"Preencha todos os campos"
        });
    }

    try{

        // criptografa senha
        const senhaHash = await bcrypt.hash(senha,10);

        // gera chaves RSA
        const { publicKey, privateKey } =
            crypto.generateKeyPairSync("rsa",{ modulusLength:2048 });

        const pub = publicKey.export({type:"pkcs1",format:"pem"});
        const priv = privateKey.export({type:"pkcs1",format:"pem"});

        db.run(
            `INSERT INTO users
            (nome,email,senha,publicKey,privateKey)
            VALUES(?,?,?,?,?)`,
            [nome,email,senhaHash,pub,priv],
            function(err){

                if(err){
                    return res.status(500).json({
                        erro:"Email já cadastrado"
                    });
                }

                res.json({
                    id: this.lastID,
                    nome: nome,
                    message: "Usuário cadastrado com sucesso"
                });
            }
        );

    }catch(error){
        res.status(500).send(error);
    }
});

/*Login*/

app.post("/login",(req,res)=>{

    const {email,senha} = req.body;

    db.get(
        "SELECT * FROM users WHERE email=?",
        [email],
        async (err,user)=>{

            if(err){
                return res.status(500).json({
                    erro:"Erro no servidor"
                });
            }

            if(!user){
                return res.status(404).json({
                    erro:"Usuário não encontrado"
                });
            }

            const senhaValida =
                await bcrypt.compare(senha,user.senha);

            if(!senhaValida){
                return res.status(401).json({
                    erro:"Senha inválida"
                });
            }

            res.json({
                message:"Login realizado",
                userId:user.id,
                nome:user.nome
            });
        }
    );
});

/*Assinar texto com senha*/

app.post("/sign", async (req, res) => {

    const { userId, texto, senha } = req.body;

    // valida dados
    if (!userId || !texto || !senha) {
        return res.status(400).json({
            erro: "Dados inválidos"
        });
    }

    // busca usuário
    db.get(
        "SELECT * FROM users WHERE id=?",
        [userId],
        async (err, user) => {

            if (err) {
                return res.status(500).json({ erro: "Erro no banco" });
            }

            if (!user) {
                return res.status(404).json({
                    erro: "Usuário não encontrado"
                });
            }

            try {

                const senhaValida =
                    await bcrypt.compare(senha, user.senha);

                if (!senhaValida) {
                    return res.status(401).json({
                        erro: "Senha incorreta"
                    });
                }

                // gera assinatura
                const assinatura = crypto.sign(
                    "sha256",
                    Buffer.from(texto),
                    user.privateKey
                ).toString("base64");

                const hash = crypto
                    .createHash("sha256")
                    .update(texto)
                    .digest("hex");

                const agora = new Date();

                const data = agora.toLocaleString("pt-BR", {
                    timeZone: "America/Araguaina"
                });

                // salva assinatura
                db.run(
                    `INSERT INTO signatures
                    (userId,texto,hash,assinatura,data)
                    VALUES(?,?,?,?,?)`,
                    [userId, texto, hash, assinatura, data],
                    function (err) {

                        if (err) {
                            return res.status(500).json({
                                erro: "Erro ao salvar assinatura"
                            });
                        }

                        res.json({
                            assinaturaId: this.lastID,
                            assinatura,
                            message: "Texto assinado com sucesso"
                        });
                    }
                );

            } catch (error) {
                res.status(500).json({
                    erro: "Erro interno"
                });
            }
        }
    );
});

/*Verificar assinatura*/

app.get("/verify/:id",(req,res)=>{

    const id = req.params.id;

    db.get(
        "SELECT * FROM signatures WHERE id=?",
        [id],
        (err,sign)=>{

            if(err) return res.status(500).send(err);
            if(!sign) return res.send("Assinatura não encontrada");

            db.get(
                "SELECT * FROM users WHERE id=?",
                [sign.userId],
                (err,user)=>{

                    if(err) return res.status(500).send(err);
                    if(!user) return res.send("Usuário não encontrado");

                    const verify = crypto.verify(
                        "sha256",
                        Buffer.from(sign.texto),
                        user.publicKey,
                        Buffer.from(sign.assinatura,"base64")
                    );

                    const resultado =
                        verify ? "VALIDA" : "INVALIDA";

                    const agora = new Date();

                    const dataLog = agora.toLocaleString("pt-BR", {
                        timeZone: "America/Araguaina"
                    });

                    db.run(
                        `INSERT INTO logs
                        (assinaturaId,resultado,data)
                        VALUES(?,?,?)`,
                        [id, resultado, dataLog]
                    );

                    res.json({
                        resultado,
                        usuario:user.nome,
                        algoritmo:"RSA + SHA256",
                        data:sign.data
                    });

                }
            );
        }
    );
});

/*Listar assinaturas do usuário */

app.get("/my-signatures/:userId",(req,res)=>{

    const userId = req.params.userId;

    db.all(
        `SELECT id,texto,data
         FROM signatures
         WHERE userId=?`,
        [userId],
        (err,rows)=>{

            if(err) return res.status(500).send(err);

            res.json(rows);
        }
    );
});

/*Listar chaves públicas*/

app.get("/public-keys",(req,res)=>{

    db.all(
        "SELECT id,nome,publicKey FROM users",
        [],
        (err,rows)=>{

            if(err) return res.status(500).send(err);

            res.json(rows);
        }
    );
});

app.post("/download-private-key", async (req,res)=>{

    const {userId, senha} = req.body;

    db.get(
        "SELECT * FROM users WHERE id=?",
        [userId],
        async (err,user)=>{

            if(!user)
                return res.status(404).send("Usuário não encontrado");

            const ok =
                await bcrypt.compare(senha,user.senha);

            if(!ok)
                return res.status(401)
                .send("Senha incorreta");

            res.json({
                privateKey:user.privateKey
            });
        }
    );
});

app.get("/download-public-key/:id",(req,res)=>{

    db.get(
        "SELECT publicKey FROM users WHERE id=?",
        [req.params.id],
        (err,user)=>{

            if(!user)
                return res.send("Não encontrado");

            res.setHeader(
                "Content-Disposition",
                "attachment; filename=publicKey.pem"
            );

            res.setHeader(
                "Content-Type",
                "application/x-pem-file"
            );

            res.send(user.publicKey);
        }
    );
});



app.listen(3000,()=>{
    console.log("Servidor rodando");
});