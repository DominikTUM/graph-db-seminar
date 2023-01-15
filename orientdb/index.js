require('dotenv').config();

const certifications = ['GCP Admin', 'AWS Admin', 'Azure Admin'];
const personLabel = 'PERSON_';
const BENCHMARK_SZIE = 500;

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getPersonName(i) {
    return personLabel + i;
}
const OrientDB = require('orientjs');

(async () => {

   async function measure(func, client, message) {
      const start = new Date();
      await func(client);

      const delta = new Date().getTime() - start.getTime();

      console.log(message + delta)
  }

  async function createPersons(client) {
      for(let i = 0; i < BENCHMARK_SZIE; i++) {
          const res = await client.query(`INSERT INTO V set name='${getPersonName(i)}'`];
          
      }
  }

  async function createCertificates(client) {
      for (const certificate of certifications) {
          const res = await client.query('INSERT INTO V set name=', [certificate]);
    
      }
  }


  async function createCertificationRelation(client) {

      for (let i = 0; i < BENCHMARK_SZIE; i++) {
          const res = await client.query(`
            CREATE EDGE FROM (SELECT FROM V WHERE name = '${getPersonName(i)}') TO 
          (SELECT FROM V WHERE type.name = '${certifications[i % 3]}')`);
          
      }
  }

  async function createPersonsRelation(client) {
      for (let i = 0; i < BENCHMARK_SZIE; i++) {
          const res = await client.query(`
            CREATE EDGE FROM (SELECT FROM V WHERE name = '${getPersonName(i)}') TO 
            (SELECT FROM V WHERE type.name = '${getPersonName((i+1) % BENCHMARK_SZIE)}')`);
          
      }    
  }

  async function execQuery(client) {
      const res = await client.query(
          'SELECT FROM V',
          [certifications[1]]);
  }


   const server = OrientDB({
      host:       'localhost',
      port:       2424,
      username:   'root',
      password:   'root'
   });

   await db.server.create({
      name:    'Seminar',
      type:    'graph',
      storage: 'plocal'
      });


   const db = server.use('Seminar');

 

   await measure(createPersons, db, 'Create persons took: ');
   await measure(createCertificates, db, 'Create certification took: ');
   await measure(createCertificationRelation, db, 'Create certificate relation took: ');
   await measure(createPersonsRelation, db, 'Create persons relation took: ');

   await measure(execQuery, db, 'PageRank took ');

   db.close();
   server.close();
})();