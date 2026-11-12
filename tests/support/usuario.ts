import { APIRequestContext, expect } from '@playwright/test';

// Usuario dinamico por test: nada hardcodeado ni de la cuenta demo.
export interface Usuario { name: string; email: string; password: string; age: number }

const NOMBRES = ['Marcela', 'Rosa', 'Lucía', 'Carmen', 'Julio', 'Percy', 'Diego', 'Milagros', 'Jhon', 'Katherine'];
const APELLIDOS = ['Quispe', 'Huamán', 'Condori', 'Mamani', 'Flores', 'Rojas', 'Vargas', 'Chávez', 'Paredes', 'Ccori'];

let contador = 0;
const elegir = (lista: string[]) => lista[Math.floor(Math.random() * lista.length)];
const quitarTildes = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function generarUsuario(): Usuario {
  const nombre = elegir(NOMBRES);
  const ap1 = elegir(APELLIDOS);
  const ap2 = elegir(APELLIDOS);
  const unico = `${Date.now()}${++contador}${Math.floor(Math.random() * 1000)}`;
  return {
    name: `${nombre} ${ap1} ${ap2}`,
    email: `${quitarTildes(nombre)}.${quitarTildes(ap1)}.${unico}@yopmail.com`,
    password: `Qa#${unico}-aA`, // 8-64 caracteres
    age: 22 + Math.floor(Math.random() * 30),
  };
}

// Precondicion por API: deja el usuario creado (201). Debe usarse page.request (misma sesion/cookies del
// navegador): con el fixture `request` independiente el login por UI responde "Email o contraseña incorrectos".
export async function registrarPorApi(request: APIRequestContext, usuario: Usuario): Promise<void> {
  const res = await request.post('/api/register', { data: usuario });
  expect(res.status(), 'precondicion: el registro por API debe devolver 201').toBe(201);
}
