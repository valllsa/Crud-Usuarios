const inquirer = require('inquirer').default;
const fs = require('fs');

const usersFilePath = './users.json';

// Función para leer usuarios desde un archivo
const readUsers = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// Función para escribir usuarios en un archivo
const writeUsers = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// Listar usuarios con filtro
const listUsers = async () => {
  const users = readUsers();
  if (!users.length) {
    console.log('No hay usuarios registrados.');
    return;
  }

  const { filter } = await inquirer.prompt([
    {
      type: 'list',
      name: 'filter',
      message: '¿Qué usuarios deseas ver?',
      choices: ['Todos', 'Completos', 'Incompletos'],
    },
  ]);

  const filteredUsers = users.filter((u) =>
    filter === 'Todos' ||
    (filter === 'Completos' && u.phone && u.address) ||
    (filter === 'Incompletos' && (!u.phone || !u.address))
  );

  if (!filteredUsers.length) {
    console.log(`No hay usuarios ${filter.toLowerCase()}.`);
  } else {
    console.log('Usuarios encontrados:');
    filteredUsers.forEach((u) =>
      console.log(`- ${u.name} (${u.complete ? 'Completo' : 'Incompleto'})`)
    );
  }
};

// Crear un nuevo usuario
const createUser = async () => {
  const { name, email, phone, address } = await inquirer.prompt([
    { name: 'name', message: 'Nombre:' },
    { name: 'email', message: 'Correo electrónico:' },
    { name: 'phone', message: 'Teléfono:' },
    { name: 'address', message: 'Dirección:' },
  ]);

  const newUser = {
    id: Date.now(),
    name,
    email,
    phone,
    address,
    complete: Boolean(phone && address),
  };

  const users = readUsers();
  writeUsers([...users, newUser]);
  console.log(`Usuario "${name}" creado exitosamente.`);
};

// Editar un usuario existente
const editUser = async () => {
  const users = readUsers();
  if (!users.length) {
    console.log('No hay usuarios registrados.');
    return;
  }

  const { name } = await inquirer.prompt([
    { name: 'name', message: 'Nombre del usuario a editar:' },
  ]);

  const user = users.find((u) => u.name.toLowerCase() === name.toLowerCase());
  if (!user) {
    console.log('Usuario no encontrado.');
    return;
  }

  const { newName, email, phone, address } = await inquirer.prompt([
    { name: 'newName', message: 'Nuevo nombre:', default: user.name },
    { name: 'email', message: 'Nuevo correo electrónico:', default: user.email },
    { name: 'phone', message: 'Nuevo teléfono:', default: user.phone },
    { name: 'address', message: 'Nueva dirección:', default: user.address },
  ]);

  Object.assign(user, {
    name: newName || user.name,
    email: email || user.email,
    phone: phone || user.phone,
    address: address || user.address,
    complete: Boolean(phone && address),
  });

  writeUsers(users);
  console.log(`Usuario "${user.name}" actualizado correctamente.`);
};

// Eliminar un usuario
const deleteUser = async () => {
  const users = readUsers();
  if (!users.length) {
    console.log('No hay usuarios registrados.');
    return;
  }

  const { name } = await inquirer.prompt([
    { name: 'name', message: 'Nombre del usuario a eliminar:' },
  ]);

  const updatedUsers = users.filter(
    (u) => u.name.toLowerCase() !== name.toLowerCase()
  );

  if (updatedUsers.length === users.length) {
    console.log('Usuario no encontrado.');
    return;
  }

  writeUsers(updatedUsers);
  console.log(`Usuario "${name}" eliminado correctamente.`);
};

// Menú principal
const mainMenu = async () => {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Seleccione una opción:',
      choices: [
        'Crear usuario',
        'Ver usuarios',
        'Editar usuario',
        'Eliminar usuario',
        'Salir',
      ],
    },
  ]);

  switch (action) {
    case 'Crear usuario':
      await createUser();
      break;
    case 'Ver usuarios':
      await listUsers();
      break;
    case 'Editar usuario':
      await editUser();
      break;
    case 'Eliminar usuario':
      await deleteUser();
      break;
    default:
      console.log('¡Hasta luego!');
      return;
  }

  await mainMenu();
};

// Iniciar la aplicación
mainMenu();
