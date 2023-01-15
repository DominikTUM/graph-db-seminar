require('dotenv').config();

const certifications = ['GCP Admin', 'AWS Admin', 'Azure Admin'];
const personLabel = 'PERSON_';
const BENCHMARK_SZIE = 8000;

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getPersonName(i) {
    return personLabel + i;
}

(async () => { 
    async function measure(func, client, message) {
        const start = new Date();
        await func(client);

        const delta = new Date().getTime() - start.getTime();

        console.log(message + delta)
    }

    async function createPersons(client) {
        for(let i = 0; i < BENCHMARK_SZIE; i++) {
            const res = await client.query('INSERT INTO public."Person"(name, birthday) values($1::text, $2::text)', [getPersonName(i), randomDate(new Date(1960, 1, 1), new Date())]);
            
        }
    }

    async function createCertificates(client) {
        for (const certificate of certifications) {
            const res = await client.query('INSERT INTO public."Certificate"(name) values($1::text)', [certificate]);
      
        }
    }


    async function createCertificationRelation(client) {

        for (let i = 0; i < BENCHMARK_SZIE; i++) {
            const res = await client.query('INSERT INTO public."PersonCertificate"("PersonName", "CertificateName") values($1::text, $2::text)', [getPersonName(i), certifications[i % 3]]);
            
        }
    }

    async function createPersonsRelation(client) {
        for (let i = 0; i < BENCHMARK_SZIE; i++) {
            const res = await client.query('INSERT INTO public."PersonPerson"(person1, person2) values($1::text, $2::text)', [getPersonName(i), getPersonName((i+1) % BENCHMARK_SZIE)]);
            
        }    
    }

    async function execQuery(client) {
        const res = await client.query(
            'SELECT * from public."Person" p, public."Certificate" c, public."PersonCertificate" pc where c.name=$1::text and p.name=pc."PersonName" and pc."CertificateName"=c.name',
            [certifications[1]]);
    }

    
    const host = process.env.HOST;
    const dbUser = process.env.USER;
    const pwd = process.env.PWD;

    const { Client } = require('pg')
    const client = new Client({
        host,
        port: 5432,
        user: dbUser,
        password: pwd,
        database: 'seminar'
    })
    await client.connect()



    await measure(createPersons, client, 'Create persons took: ');
    await measure(createCertificates, client, 'Create certification took: ');
    await measure(createCertificationRelation, client, 'Create certificate relation took: ');
    await measure(createPersonsRelation, client, 'Create persons relation took: ');


   // await measure(execPageRank, dgraphClient, 'PageRank took ');
    await measure(execQuery, client, 'PageRank took ');
    client.end();
})();