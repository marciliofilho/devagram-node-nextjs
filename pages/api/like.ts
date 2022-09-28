import type { NextApiRequest, NextApiResponse } from 'next';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { PublicacaoModel } from '../../models/PublicacaoModel';
import { UsuarioModel } from '../../models/UsuarioModel';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';

const likeEndpoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
        if (req.method === 'PUT') {
            //id da publicacao
            const { id } = req?.query;
            const publicacao = await PublicacaoModel.findById(id);
            if (!publicacao) {
                res.status(400).json({ erro: 'Publicação não encontrada.' });
            }
            const { userId } = req?.query;
            const usuario = await UsuarioModel.findById(userId);
            if (!usuario) {
                return res.status(400).json({ erro: 'Usuário não encontrado.' });
            }
            const indexUsuarioLike = publicacao.likes.findIndex((e: any) => e.toString() === usuario._id.toString());
            // se o index for diferente de -1, curtiu a publicação
            if (indexUsuarioLike != -1) {
                publicacao.likes.splice(indexUsuarioLike, 1);
                await PublicacaoModel.findByIdAndUpdate({ _id: publicacao._id }, publicacao);
                return res.status(200).json({ msg: 'Publicação descurtida com sucesso' });
            } else {
                //caso contrário não curtiu
                publicacao.likes.push(usuario._id);
                await PublicacaoModel.findByIdAndUpdate({ _id: publicacao._id }, publicacao);
                return res.status(200).json({ msg: 'Publicação curtida com sucesso.' });
            }
        }
        return res.status(405).json({ erro: 'Método informado não é válido.' })
    } catch (e) {
        console.log(e);
        return res.status(500).json({ erro: 'Ocorreu erro ao curtir/descurtir a publicação.' })
    }
}

export default validarTokenJWT(conectarMongoDB(likeEndpoint));