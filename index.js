const http = require('http');
// const { parse } = require('url');

const PORT = 3000;

// 

let recipes = [
    {
        id: 1,
        name: "Pâtes bolo",
        difficulty: "moyenne",
        ingredients: ["pâtes", "tomate", "viande"],
        isVegetarian: false
    },
    {
        id: 2,
        name: "Salade César",
        difficulty: "facile",
        ingredients: ["salade", "poulet"],
        isVegetarian: false
    }
];

let nextId = 3;

// 
const sendJson = (res, code, payload) => {
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload));
};


// 
const parseBody = (req) => {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => {
            data += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(data));
            } catch (err) {
                reject(err);
            }
        });
    });
};

// créa serveur

http.createServer(async (req, res) => {  // async AVANT (req, res)
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    const { pathname } = reqUrl;
    const method = req.method;

    // Debug
    console.log(`${method} ${pathname}`);

    // GET /api/recipes - Retourne toutes les recettes
    if (method === 'GET' && pathname === '/api/recipes') {
        return sendJson(res, 200, recipes);
    }

    // GET /api/recipes/:id - Retourne une recette précise
    if (method === 'GET' && pathname.startsWith('/api/recipes/') && pathname !== '/api/recipes') {
        const id = Number(pathname.split('/')[3]);
        const recipe = recipes.find(r => r.id === id);
    
        if (!recipe) {
            return sendJson(res, 404, { error: 'Recette non trouvée' });
        }
    
        return sendJson(res, 200, recipe);
    }

    // POST /api/recipes - Crée une nouvelle recette
    if (method === 'POST' && pathname === '/api/recipes') {
        try {
            const body = await parseBody(req);

            // Validation des champs requis
            if (!body.name || !body.difficulty || !body.ingredients) {
                return sendJson(res, 400, {
                    error: 'Les champs name, difficulty et ingredients sont requis'
                });
            }

            // Création de la nouvelle recette
            const newRecipe = {
                id: nextId++,
                name: body.name,
                difficulty: body.difficulty,
                ingredients: body.ingredients,
                isVegetarian: body.isVegetarian || false
            };

            recipes.push(newRecipe);

            return sendJson(res, 201, newRecipe);
        } catch (err) {
            return sendJson(res, 400, { error: 'JSON invalide' });
        }
    }




    // PUT /api/recipes/:id - Modifie entièrement une recette
    if (method === 'PUT' && pathname.startsWith('/api/recipes/')) {
        const id = Number(pathname.split('/')[3]);
        const index = recipes.findIndex(r => r.id === id);

        if (index === -1) {
            return sendJson(res, 404, { error: 'Recette non trouvée' });
        }

        try {
            const body = await parseBody(req);

            if (!body.name || !body.difficulty || !body.ingredients) {
                return sendJson(res, 400, {
                    error: 'Les champs name, difficulty et ingredients sont requis'
                });
            }

            const updated = {
                id,
                name: body.name,
                difficulty: body.difficulty,
                ingredients: body.ingredients,
                isVegetarian: body.isVegetarian || false
            };

            recipes[index] = updated;
            return sendJson(res, 200, updated);

        } catch (err) {
            return sendJson(res, 400, { error: 'JSON invalide' });
        }
    }



    // DELETE /api/recipes/:id - Supprime une recette
    if (method === 'DELETE' && pathname.startsWith('/api/recipes/')) {
        const id = Number(pathname.split('/')[3]);
        const index = recipes.findIndex(r => r.id === id);

        if (index === -1) {
            return sendJson(res, 404, { error: 'Recette non trouvée' });
        }

        recipes.splice(index, 1);

        return sendJson(res, 200, { message: 'Recette supprimée' });
    }








    // Route par défaut - 404
    sendJson(res, 404, { error: 'Route non trouvée' });
})
    .listen(PORT, () => {
        console.log(`API Recettes prête sur http://localhost:${PORT}`);
        console.log(`${recipes.length} recette(s) chargée(s)`);
    });
