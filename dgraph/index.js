require('dotenv').config();

const certifications = ['GCP Admin', 'AWS Admin', 'Azure Admin'];
const personLabel = 'PERSON_';
const BENCHMARK_SZIE = 2000;


const uri = process.env.URI;
const token = process.env.USER;

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getPersonName(i) {
  return personLabel + i;
}

async function measure(func, client, message) {
  const start = new Date();
  await func(client);

  const delta = new Date().getTime() - start.getTime();

  console.log(message + delta)
}

async function createPersons(client) {
  for(let i = 0; i < BENCHMARK_SZIE; i++) {
    const request = `
     mutation {
          addPerson(input: {
               name: "${getPersonName(i)}",
               birthday: "${randomDate(new Date(1960, 1, 1), new Date()).toDateString()}"
          }) {
               person {name, birthday}
          }
     }`;
      await dgraphClient.newTxn().doRequest(request);
  }
}

async function createCertificates(client) {
  for (const certificate of certifications) {
    const request = `mutation {
      addCertificate(input: {
           name: "${certificate}",
      }) {
           certificate {name}
      }
 }`;
      await dgraphClient.newTxn().doRequest(request);
  }
}

async function createCertificationRelation(client) {
  for (const certificate of certifications) {
    const request = `mutation {
      addCertificate(input: {
           name: "${certificate}",
      }) {
           certificate {name}
      }
 }`;
      await dgraphClient.newTxn().doRequest(request);
  }
}

async function execQuery(client) {
  const query = `{
    persons(func: has(knows))
    {
      name
    }
  }`
  const res = await this.dgraph.newTxn().query(query);  
}

const dgraph = require("dgraph-js");

const clientStub = dgraph.clientStubFromSlashGraphQLEndpoint(
  uri,
  token
);
const dgraphClient = new dgraph.DgraphClient(clientStub);

await measure(createPersons, dgraphClient, 'Create persons took: ');
await measure(createCertificates, dgraphClient, 'Create certification took: ');
await measure(createCertificationRelation, dgraphClient, 'Create certificate relation took: ');
await measure(createPersonsRelation, dgraphClient, 'Create persons relation took: ');


//await measure(execPageRank, dgraphClient, 'PageRank took ');
await measure(execQuery, dgraphClient, 'PageRank took ');


const query = `query all($a: string) {
  all(func: eq(name, $a))
  {
    name
  }
}`;
const vars = { $a: "Alice" };
const res = await dgraphClient.newTxn().queryWithVars(query, vars);
const ppl = res.getJson();
dgraphClient.newTxn().mutate
