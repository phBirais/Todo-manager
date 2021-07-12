const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require("uuid");

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());


/**
 *  nome -  string (receber)
 *  username - string (receber)
 *  id - uuid (registro único gerado no cadastro)
 *  todos [] lista de atividades
 */
const users = []; //lista de usuários

//checar se a conta existe
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  //se n existe o user
  if (!user) {
    return response.status(400).json({ error: "User not found" });
  }

  request.user = user;//repassar para as rotas

  //se existir pode prosseguir

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body; //recebe as infos na req

  //busca
  const usernameAlreadyExists = users.some(
    (user) => user.username === username);

  //se ja existir usuário, retorna um erro
  if (usernameAlreadyExists) {
    return response.status(400).json({
      error: "Username already exists!"
    });
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });

  return response.status(201).json(users[users.length - 1]);
});

//listar todos de um usuário
app.get('/todos', checksExistsUserAccount, (request, response) => {
  //const { username } = request.headers; 
  const { user } = request;
  return response.json(user.todos);
});

//criar um Todo
app.post('/todos', checksExistsUserAccount, (request, response) => {

  // recebe title e deadline no corpo da request
  const { title, deadline } = request.body;

  const { user } = request;

  //cria operação
  const todoOperation = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date,
  }

  user.todos.push(todoOperation);

  return response.status(201).json(todos[todos.length - 1]);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;