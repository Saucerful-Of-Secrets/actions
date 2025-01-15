/* eslint-disable @typescript-eslint/no-unused-vars */
import { ACTIONS_CORS_HEADERS, createPostResponse, } from '@solana/actions';
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, } from '@solana/web3.js';
import { DEFAULT_SOL_ADDRESS } from './const';
export const GET = async (req) => {
    const payload = {
        icon: new URL('/decommas.jpg', new URL(req.url).origin).toString(),
        label: 'Test task',
        description: 'Send 0.01 sol',
        title: 'Sending funds',
        links: {
            actions: [
                {
                    type: 'transaction',
                    href: '/api/actions/donate?amount=0.1',
                    label: '0.01 SOL',
                },
            ],
        },
    };
    return Response.json(payload, {
        headers: ACTIONS_CORS_HEADERS,
    });
};
export const OPTIONS = GET;
export const POST = async (req) => {
    try {
        const url = new URL(req.url);
        const body = await req.json();
        let account;
        try {
            account = new PublicKey(body.account);
        }
        catch (err) {
            throw "Invalid 'account' provided. Its not a real pubkey";
        }
        let amount = 0.1;
        if (url.searchParams.has('amount')) {
            try {
                amount = parseFloat(url.searchParams.get('amount') || '0.1') || amount;
            }
            catch (err) {
                throw "Invalid 'amount' input";
            }
        }
        const connection = new Connection(clusterApiUrl('devnet'));
        const TO_PUBKEY = new PublicKey(DEFAULT_SOL_ADDRESS);
        const transaction = new Transaction().add(SystemProgram.transfer({
            fromPubkey: account,
            lamports: amount * LAMPORTS_PER_SOL,
            toPubkey: TO_PUBKEY,
        }));
        transaction.feePayer = account;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        const payload = await createPostResponse({
            fields: {
                type: 'transaction',
                transaction,
                message: 'Transaction sent',
            },
        });
        return Response.json(payload, {
            headers: ACTIONS_CORS_HEADERS,
        });
    }
    catch (err) {
        let message = 'An unknown error occurred';
        if (typeof err == 'string')
            message = err;
        return Response.json({
            message,
        }, {
            headers: ACTIONS_CORS_HEADERS,
        });
    }
};
