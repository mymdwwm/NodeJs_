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

  http.createServer((req, res) => {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    const { pathname } = reqUrl;
    const method = req.method;

    //debuge
    console.log(`${method} ${pathname}`);
  
    /// GET /api/recipes - Retourne toutes les recettes
    if (method === 'GET' && pathname === '/api/recipes') {
        return sendJson(res, 200, recipes);
      }
    // Route par défaut - 404
    sendJson(res, 404, { error: 'Route non trouvée' });
  })
  .listen(PORT, () => {
    console.log(`API Recettes prête sur http://localhost:${PORT}`);
  });
  