// IMPORT des modules

const http = require('http'); /* Création du serveur avec node */

const PORT = 3000; /* port de lancement du serveur */

// DONNÉES
// liste des recettes (tableau) servant de données de départ
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

let nextId = 3; /* incrémentation du prochain id a partir de 3 */

// Renvoie de la reponse au format json
const sendJson = (res, code, payload) => {
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload));
};


// Fonction asynchrone ; analyser les requêtes Http
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
    const reqUrl = new URL(req.url, `http://${req.headers.host}`); /* objet url */
    const { pathname } = reqUrl; /* chemin */
    const method = req.method; /* methode */

            // ROUTES classiques 

    // GET /api/recipes : Toutes les recettes
    if (method === 'GET' && pathname === '/api/recipes') {
        return sendJson(res, 200, recipes);
    }


            // ROUTES Complexe prt2

    // GET /api/recipes/search?ingredient=poulet
if (method === 'GET' && pathname === '/api/recipes/search') {
    const ingredient = reqUrl.searchParams.get('ingredient');

    if (!ingredient) {
        return sendJson(res, 400, { error: "Le paramètre 'ingredient' est requis" });
    }

    const results = recipes.filter(recipe =>
        recipe.ingredients.includes(ingredient)
    );

    return sendJson(res, 200, results);
}


            // ROUTES classiques 
    // GET /api/recipes/:id - Une recette précise
    if (method === 'GET' && pathname.startsWith('/api/recipes/') && pathname !== '/api/recipes') {
        const id = Number(pathname.split('/')[3]);
        const recipe = recipes.find(r => r.id === id);
    
        if (!recipe) {
            return sendJson(res, 404, { error: 'Recette non trouvée' });
        }
    
        return sendJson(res, 200, recipe);
    }

    // POST /api/recipes - Nouvelle recette
    if (method === 'POST' && pathname === '/api/recipes') {
        try {
            const body = await parseBody(req);

            // validation des champs 
            if (!body.name || !body.difficulty || !body.ingredients) {
                return sendJson(res, 400, {
                    error: 'Les champs name, difficulty et ingredients sont requis'
                });
            }

            // Création de nouvelle recette
            const newRecipe = {
                id: nextId++,
                name: body.name,
                difficulty: body.difficulty,
                ingredients: body.ingredients,
                isVegetarian: body.isVegetarian || false
            };

            recipes.push(newRecipe); /* ajout */

            return sendJson(res, 201, newRecipe);
        } catch (err) {
            return sendJson(res, 400, { error: 'JSON invalide' });
        }
    }

    // PUT /api/recipes/:id - Modifie entièrement une recette
    if (method === 'PUT' && pathname.startsWith('/api/recipes/')) {
        const id = Number(pathname.split('/')[3]);
        const index = recipes.findIndex(r => r.id === id); /* recherche par index */


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
            /*maj */
            const updated = {
                id,
                name: body.name,
                difficulty: body.difficulty,
                ingredients: body.ingredients,
                isVegetarian: body.isVegetarian || false
            };

            recipes[index] = updated; /* applique la modificatio */
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


            // ROUTES complexes 

    // GET /api/recipes/search?vegetarian=true
if (method === 'GET' && pathname === '/api/recipes/search') {
    const vegetarian = reqUrl.searchParams.get("vegetarian");

    if (vegetarian !== null) {
        const isVeg = vegetarian === "true";
        return sendJson(res, 200, recipes.filter(r => r.isVegetarian === isVeg));
    }

    const ingredient = reqUrl.searchParams.get("ingredient");

    if (ingredient) {
        return sendJson(
            res,
            200,
            recipes.filter(r => r.ingredients.includes(ingredient))
        );
    }

    return sendJson(res, 400, { error: 'Paramètres invalides' });
}









    // défaut - 404
    sendJson(res, 404, { error: 'Route non trouvée' });
})
    .listen(PORT, () => {
        console.log(`API Recettes prête sur http://localhost:${PORT}`);
        console.log(`${recipes.length} recette(s) chargée(s)`);
    });
