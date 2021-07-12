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
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;//repassar para as rotas

  //se existir pode prosseguir

  return next();
}

function checksExistsTodo(request, response, next) {

  const { id } = request.params;
  const { user } = request; //recebendo user pelo middleware

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: "todo not found" });
  }

  request.todoIndex = todoIndex;

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

  return response.status(201).json(user.todos[user.todos.length - 1]);

});

//atualizar o todo criado
app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  // Complete aqui
  const { title, deadline } = request.body;
  const { id } = request.params; //recebendo id pela rota
  const { user, todoIndex } = request; //recebendo user e index pelo middleware

  /*const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  //console.log(index);

  //se n existe o todo
  if (todoIndex < 0) {
    return response.status(404).json({ error: "todo not found" });
  }*/

  //modificar todo de index encontrado
  user.todos[todoIndex] = {
    id: id,
    title: title,
    done: user.todos[todoIndex].done,
    deadline: new Date(deadline),
    created_at: user.todos[todoIndex].created_at,
  };

  return response.status(201).json(user.todos[todoIndex]);
});

//alterar Todo para done
app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {

  const { user, todoIndex } = request;

  //alterando todo para done
  user.todos[todoIndex].done = true;

  //retornando a requisição com o objeto todo
  return response.status(200).json(user.todos[todoIndex]);

});

//delete Todo
app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user, todoIndex } = request;

  //deletar todo escolhido
  user.todos.splice(todoIndex, 1);

  //se deletar funcionar
  return response.status(204).send();
});

module.exports = app;