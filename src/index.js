const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.body;

  const usersAreExists = users.find(user => user.username === username);

  if(usersAreExists){
    return response.status(404).json({ error: 'User does not exists' });
  }

  return next();
}

app.post('/users', (request, response) => {
  const {name, username } = request.body;

  const usersAreExists = users.find(user => user.username === username);

  if(usersAreExists){
    return response.status(400).json({ error: 'User already exists' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
    created_at: new Date(),
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const todosByUsername = users.find(user => username === user.username);

  if(!todosByUsername) return response.status(401).send({error: `There is not todo in list by this username: ${username}`});
  
  return response.json(todosByUsername.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  const existeUser = users.find(user => user.username === username );
  
  if(!existeUser){
    return response.status(401).send({error: `There is not user in list with this username: ${username}`});
  }
  
  existeUser.todos.push(todo);  

 return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const { id } = request.params;
  
  const usersToChangeTodos = users.find(identificador => identificador.username === username);
  const todoToChange = usersToChangeTodos.todos.find(todoId => todoId.id === id);

  if(!todoToChange) {
    return response.status(404).send({error: `There is not todo in list with this Id: ${id}`});
  }
  
  todoToChange.title = title;
  todoToChange.deadline = deadline;

  return response.json(todoToChange);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const todosByUser = users.find(identificador => identificador.username === username).todos;
  const index = todosByUser.findIndex(todo => todo.id === id);

  if(index === -1) {
    return response.status(404).send({error: `There is not todo in list with this Id: ${id}`});
  }

  todosByUser[index].done = true;

  return response.json(todosByUser[index]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  
  const todosByUser = users.find(identificador => identificador.username === username).todos;
  const index = todosByUser.findIndex(todo => todo.id === id);

  if(index === -1) {
    return response.status(404).send({error: `There is not todo in list with this Id: ${id}`});
  }

  todosByUser.splice(index, 1);

  return response.status(204).send();
});

module.exports = app;