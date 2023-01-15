const { write } = require('fs');

require('dotenv').config();

const certifications = ['GCP Admin', 'AWS Admin', 'Azure Admin'];
const personLabel = 'PERSON_';
const BENCHMARK_SZIE = 1000;

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getPersonName(i) {
    return personLabel + i;
}

async function measure(func, driver, message) {
    const start = new Date();
    await func(driver);

    const delta = new Date().getTime() - start.getTime();

    console.log(message + delta)
}

(async() => {
    const neo4j = require('neo4j-driver');

    const uri = process.env.URI;
    const user = process.env.USER;
    const password = process.env.PWD;
    
    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

    try {
        
        const session = driver.session({ database: 'neo4j' });
        const writeQuery = `MATCH (n:Person)
                            DETACH DELETE n`;

        const writeResult = await session.run(writeQuery, { });
        
        console.log(writeResult);

        await measure(createPersons, driver, 'Create persons took: ');
        await measure(createCertificates, driver, 'Create certification took: ');
        await measure(createCertificationRelation, driver, 'Create certificate relation took: ');
        await measure(createPersonsRelation, driver, 'Create persons relation took: ');

        
    //    await measure(execPageRank, driver, 'PageRank took ');
        await measure(execQuery, session, 'Exec query took ');

    } catch (error) {
        console.error(`Something went wrong: ${error}`);
    } finally {
        await driver.close();
    }

    async function execQuery(session) {

        try {
            const writeQuery = `MATCH (p:Person)-[:HAS]->(:Certificate {name: $cert})
                                RETURN p`;

            const writeResult = await session.run(writeQuery, {cert: certifications[1] });
            
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
        } finally {
            // Close down the session if you're not using it anymore.
            await session.close();
        }
    }

    async function execPageRank(driver) {
        const session = driver.session({ database: 'neo4j' });

        try {
            const writeQuery = `CALL gds.graph.project(
                                    'myGraph',
                                    'Person',
                                    'KNOWS',
                                    {
                                        relationshipProperties: 'weight'
                                    }
                                )`;

            const writeResult = await session.run(writeQuery, {  });
            console.log(writeResult);
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
        } finally {
            // Close down the session if you're not using it anymore.
            await session.close();
        }
    }

    async function createCertificationRelation (driver) {

        // To learn more about sessions: https://neo4j.com/docs/javascript-manual/current/session-api/
        const session = driver.session({ database: 'neo4j' });

        try {
            // To learn more about the Cypher syntax, see: https://neo4j.com/docs/cypher-manual/current/
            // The Reference Card is also a good resource for keywords: https://neo4j.com/docs/cypher-refcard/current/
            
            for (let i = 0; i < BENCHMARK_SZIE; i++) {
                const writeQuery = `MATCH (p:Person { name: $personName })
                                    MATCH (c:Certificate { name: $certificate })
                                    CREATE (p)-[:HAS]->(c)
                                    RETURN p, c`;

                // Write transactions allow the driver to handle retries and transient errors.
                const writeResult = await session.run(writeQuery, { personName: getPersonName(i), certificate: certifications[i % 3] });
            }
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
        } finally {
            // Close down the session if you're not using it anymore.
            await session.close();
        }
    }

    async function createPersonsRelation(driver) {

        const session = driver.session({ database: 'neo4j' });

        try {
            
            for (let i = 0; i < BENCHMARK_SZIE; i++) {
                const writeQuery = `MATCH (p1:Person { name: $personName1 })
                                    MATCH (p2:Person { name: $personName2 })
                                    CREATE (p1)-[:KNOWS {weight: 1.0}]->(p2)
                                    RETURN p1, p2`;

                // Write transactions allow the driver to handle retries and transient errors.
                const writeResult = await session.run(writeQuery, { personName1: getPersonName(i), personName2: getPersonName((i+1) % BENCHMARK_SZIE) });
            }
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
        } finally {
            // Close down the session if you're not using it anymore.
            await session.close();
        }
    }

    async function createCertificates(driver) {

        const session = driver.session({ database: 'neo4j' });

        try {
            for (const certificate of certifications) {
                const writeQuery = `CREATE (n:Certificate {name: $certificate })`;
                                
                const writeResult = await session.run(writeQuery, { certificate });
            }
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
        } finally {
            await session.close();
        }
    }

    async function createPersons(driver) {

        const session = driver.session({ database: 'neo4j' });

        try {
            
            for (let i = 0; i < BENCHMARK_SZIE; i++) {
                const writeQuery = `CREATE (n:Person {name: $personName, birthday: $birthday }) RETURN n`;
                                
                const writeResult = await session.run(writeQuery, { personName: getPersonName(i), birthday: randomDate(new Date(1960, 1, 1), new Date()).toDateString() });              
                
            }
        } catch (error) {
            console.error(`Something went wrong: ${error}`);
        } finally {
            await session.close();
        }
    }


})();
