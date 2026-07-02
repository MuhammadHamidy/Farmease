const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'docs', 'postman_collection.json');
if (!fs.existsSync(file)) {
    console.error("postman_collection.json not found!");
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(file, 'utf8'));

// 1. Set Collection-level Auth to Bearer Token
data.auth = {
  type: "bearer",
  bearer: [
    {
      key: "token",
      value: "{{token}}",
      type: "string"
    }
  ]
};

// 2. Add Collection Variables
data.variable = [
  {
    key: "baseUrl",
    value: "http://localhost:8080",
    type: "string"
  },
  {
    key: "token",
    value: "",
    type: "string"
  }
];

// Helper to process items recursively
function processItems(items) {
  for (const item of items) {
    if (item.item) {
      processItems(item.item);
    } else {
      // 3. Remove individual auth to inherit from collection
      if (item.request && item.request.auth) {
        delete item.request.auth;
      }
      
      // 4. Add Auto-Token extraction script to Login endpoint
      if (item.request && item.request.url && Array.isArray(item.request.url.path)) {
        const pathStr = item.request.url.path.join('/');
        if (pathStr.includes('auth/login') && item.request.method === 'POST') {
          item.event = item.event || [];
          item.event.push({
            listen: "test",
            script: {
              exec: [
                "var jsonData = pm.response.json();",
                "if (jsonData.data && jsonData.data.token) {",
                "    pm.collectionVariables.set('token', jsonData.data.token);",
                "    console.log('Token successfully captured and saved to collection variable!');",
                "}"
              ],
              type: "text/javascript"
            }
          });
        }
      }
    }
  }
}

if (data.item) {
    processItems(data.item);
}

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log("Postman collection successfully injected with Auto-Token and Bearer Auth.");
