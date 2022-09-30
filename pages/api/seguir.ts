import type { NextApiRequest, NextApiResponse } from 'next';
import { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { UsuarioModel } from '../../models/UsuarioModel';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { SeguidorModel } from '../../models/SeguidorModel';

const endpointSeguir = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
        if (req.method === 'PUT') {
            const { userId, id } = req?.query;

            const usuarioLogado = await UsuarioModel.findById(userId);
            if (!usuarioLogado) {
                return res.status(400).json({ erro: 'Usuário logado não encontrado.' });
            }

            const usuarioASerSeguido = await UsuarioModel.findById(id);
            if (!usuarioASerSeguido) {
                return res.status(400).json({ erro: 'Usuário a ser seguido não encontrado.' })
            }

            //buscar se  EU LOGADO segue ou não este usuário
            const euJaSigoEsseUsuario = await SeguidorModel.find({ usuarioId: usuarioLogado._id, usuarioSeguidoId: usuarioASerSeguido._id });
            if (euJaSigoEsseUsuario && euJaSigoEsseUsuario.length > 0) {
                //sinal que ja sigo esse usuário

                euJaSigoEsseUsuario.forEach(async (e: any) => await SeguidorModel.findByIdAndDelete({ _id: e._id }));
                
                usuarioLogado.seguindo--;
                await UsuarioModel.findByIdAndUpdate({ _id: usuarioLogado._id }, usuarioLogado);

                usuarioASerSeguido.seguidores--;
                await UsuarioModel.findByIdAndUpdate({ _id: usuarioASerSeguido._id }, usuarioASerSeguido);

                return res.status(200).json({ msg: 'Deixou de seguir o usuário com sucesso.' });
            } else {
                //sinal que eu não sigo esse usuário
                const seguidor = {
                    usuarioId: usuarioLogado._id,
                    usuarioSeguidoId: usuarioASerSeguido._id
                };
                await SeguidorModel.create(seguidor);

                //adicionar um seguindo no usuário logado
                usuarioLogado.seguindo++;
                await UsuarioModel.findByIdAndUpdate({ _id: usuarioLogado._id }, usuarioLogado);

                //adicionar um seguidor no usuário seguido
                usuarioASerSeguido.seguidores++;
                await UsuarioModel.findByIdAndUpdate({ _id: usuarioASerSeguido._id }, usuarioASerSeguido);

                return res.status(200).json({ msg: 'Usuário seguido com sucesso.' });
            }
        }
        return res.status(405).json({ erro: 'Método informado não existe.' });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ erro: 'Não foi possível seguir/deseguir o usuário niformado.' });
    }
}

export default validarTokenJWT(conectarMongoDB(endpointSeguir));