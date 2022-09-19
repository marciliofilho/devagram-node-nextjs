import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next';
import mongoose, { mongo } from 'mongoose';
import type {RespostaPadraoMsg} from '../types/RespostaPadraoMsg';

export const conectarMongoDB = (handler : NextApiHandler) => 
    async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg>) => {

    // verificar se o banco está conectado, se, continuar para endpoint ou prox middleware
    if(mongoose.connections[0].readyState){
        return handler(req, res);
    }

    // ja que não esta conectado vamos conectar
    // obter variavel de ambiente preenchida do env
    const {DB_CONEXAO_STRING} = process.env;

    // se a env estiver vazia aborta o uso do sistema e avisa o programador
    if(!DB_CONEXAO_STRING){
        return res.status(500).json({ erro : 'ENV de configuração do banco não informado'});
    }

    mongoose.connection.on('connected', () => console.log('Banco de dados conectado'));
    mongoose.connection.on('error', error => console.log(`ocorreu um erro ao conectar no banco: ${error}`));
    await mongoose.connect(DB_CONEXAO_STRING);

    //seguir para o endpoint, pois está conectado
    return handler(req, res);
}