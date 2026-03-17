const express = require("express");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors");

const db = require("./database");

const app = express();

app.use(cors());
app.use(bodyParser.json());

/* =========================
   CADASTRO
========================= */

app.post("/register", (req,res)=>{

    const {nome} = req.body;

    const { publicKey, privateKey } =
        crypto.generateKeyPairSync("rsa",{ modulusLength:2048 });

    const pub = publicKey.export({type:"pkcs1",format:"pem"});
    const priv = privateKey.export({type:"pkcs1",format:"pem"});

    db.run(
        "INSERT INTO users(nome,publicKey,privateKey) VALUES(?,?,?)",
        [nome,pub,priv],
        function(err){

            if(err) return res.status(500).send(err);

            res.json({
                id:this.lastID,
                message:"Usuário criado"
            });
        }
    );
});


/* =========================
   ASSINAR TEXTO
========================= */

app.post("/sign",(req,res)=>{

    const {userId,texto} = req.body;

    db.get(
        "SELECT * FROM users WHERE id=?",
        [userId],
        (err,user)=>{

            if(err) return res.status(500).send(err);
            if(!user) return res.send("Usuário não encontrado");

            // ✅ ASSINA O TEXTO DIRETO
            const assinatura = crypto.sign(
                "sha256",
                Buffer.from(texto),
                user.privateKey
            ).toString("base64");

            const hash = crypto
                .createHash("sha256")
                .update(texto)
                .digest("hex");

            const data = new Date().toISOString();

            db.run(
                `INSERT INTO signatures
                (userId,texto,hash,assinatura,data)
                VALUES(?,?,?,?,?)`,
                [userId,texto,hash,assinatura,data],
                function(err){

                    if(err) return res.status(500).send(err);

                    res.json({
                        assinaturaId:this.lastID,
                        assinatura
                    });
                }
            );
        }
    );
});


/* =========================
   VERIFICAR ASSINATURA
========================= */

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

                    // ✅ verifica usando TEXTO ATUAL DO BANCO
                    const verify = crypto.verify(
                        "sha256",
                        Buffer.from(sign.texto),
                        user.publicKey,
                        Buffer.from(sign.assinatura,"base64")
                    );

                    const resultado =
                        verify ? "VALIDA" : "INVALIDA";

                    // salva log
                    db.run(
                        `INSERT INTO logs
                        (assinaturaId,resultado,data)
                        VALUES(?,?,?)`,
                        [id,resultado,new Date().toISOString()]
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


app.listen(3000,()=>{
    console.log("Servidor rodando");
});