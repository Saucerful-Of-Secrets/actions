import { ACTIONS_CORS_HEADERS } from '@solana/actions';
export const GET = async () => {
    const payload = {
        rules: [
            {
                pathPattern: '/now',
                apiPath: '/api/actions/donate',
            },
        ],
    };
    return Response.json(payload, {
        headers: ACTIONS_CORS_HEADERS,
    });
};
export const OPTIONS = GET;
