const express = require('express');
const bodyParser = require('body-parser');
const handleBars  = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session');
const listaUsuarios = require('./data/usuarios.json');

//Gerar a aplicação
const app = express();

//Configurar o handlebars
app.engine('handlebars', handleBars());
app.set('view engine', 'handlebars');

//Middlewares
app.use(session({secret: 'frase_cifrada'}));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

//Conectar ao bd
mongoose.connect("mongodb://localhost/mastertech");

//Schema
const Aluno = mongoose.model("Aluno", {nome: String, idade: Number});

//Métodos HTTP
app.get("/", (request, response) => {
    Aluno.find((err, alunos) => {
        if(err){
            return response.render("erro");
        }
        response.render("alunos", {list: alunos});
    });
    //Funcionamento com JSON
    // let alunos = [{nome: "Felipe", idade: 28},
    //               {nome: "Thais", idade: 27}];
    //response.render("alunos", {listagemAlunos: alunos});
});
app.get("/novo", (request, response) => {
    response.render("novo");
});
app.get("/:idAluno", (request, response) => {
    Aluno.findById(request.params.idAluno, (err, aluno) => {
        response.render('novo', { a : aluno});
    });
});

app.post('/salvar', (request, response) => {
    //Update
    if (request.body._id !== '') {
        let novoValor = request.body;
        Aluno.findByIdAndUpdate(request.body._id, novoValor, {new: true}, (err, aluno) => {
        response.redirect('/');
    });
    } else {
        //Insert
        let aluno = new Aluno(request.body);
        aluno._id = null;
        aluno.save((err, a) => {
            response.redirect('/');
        });
    }
});
  
app.get('/del/:idAluno', (request, response) => {
    Aluno.findByIdAndRemove(request.params.idAluno, (err, aluno) => {
        if(err)
            console.log(err);
    });
    response.redirect('/');
});

app.get('/login', (request, response) => {
    console.log("Get-login");
    response.render('login');
});

app.post('/login', (request, response) => {
    //Verificar se o formulário foi enviado em branco
    console.log("Post - login " + request.body + "#");
    if(request.body.nome == '' || request.body.senha == '' ){
        console.log("Erro: alguma das informações em branco");
        response.status(400).render('login');
    }

    //Percorre a lista de usuários
    for(let usuario of listaUsuarios){
        //verifica cada usuário para buscar um email e senha que
        //correspondam ao usuário e senha enviados no formulário
        if(request.body.nome == usuario.nome && request.body.senha == usuario.senha){
            //Achamos o usuário!
            console.log("Achamos o usuário");

            //Grava o email do usuário na sessão
            request.session.nome = request.body.nome;
            console.log("Session: " + request.session);
            //Redireciona para a página admin
            response.redirect('/admin');
            //encerra a função...
            //já encontramos o usuário, não precisamos verificar o restante
            return;
        }
    }

    //Essa linha só será executada se todos os usuários foram
    //testados. Nesse caso, vamos exibir a página de login com
    //uma mensagem de erro.
    response.render('login');
});    

app.get('/admin', (request, response) => {
    console.log("Get - admin");
    response.render('admin');
});

//Subir servidor
var server = app.listen(3000, () => {
    console.log("Estou escutando a porta 3000!");
});