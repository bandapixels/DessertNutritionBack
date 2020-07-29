import express from 'express';
import {ApolloServer, gql} from 'apollo-server-express';
import cors from 'cors';

interface Dessert {
    id: number;
    name: string;
    cal: number;
    fatG: number;
    carbG: number;
    proteinG: number;
}

let dessertCollection: Dessert[] = [
    {
        id: 0,
        name: "Oreo",
        cal: 437,
        fatG: 18,
        carbG: 63,
        proteinG: 4,
    },
    {
        id: 1,
        name: "Nougat",
        cal: 360,
        fatG: 19,
        carbG: 9,
        proteinG: 37,
    },
];
let dessertIdIterator = 2;

const typeDefs = gql`
  type Dessert {
    id: ID!
    name: String!
    cal: String!
    fatG: String!
    carbG: String!
    proteinG: String!
  }
  
  input DessertInput {
    name: String!
    cal: String!
    fatG: String!
    carbG: String!
    proteinG: String!
  }
  
  enum Order {
    ASC
    DESC
  }

  type Query {
    desserts(key: String, order: Order): [Dessert]!
  }
  
  type Mutation {
    addDessert(dessert: DessertInput!): Dessert!
    deleteDessert(id: [ID]!): [Dessert]!
    reset: [Dessert]!
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
    Query: {
        desserts: (parent: any, args: any, context: any, info: any) => {
            if (args.key) {
                const separateDessertCollection = [...dessertCollection];

                const order = args.order ?? 'ASC';

                // @ts-ignore
                separateDessertCollection.sort((a, b) => {
                    if (order === 'ASC') {
                        if (args.key === 'name') {
                            return a.name.localeCompare(b.name)
                        }

                        // @ts-ignore
                        return a[args.key] > b[args.key];
                    } else {
                        if (args.key === 'name') {
                            return b.name.localeCompare(a.name)
                        }

                        // @ts-ignore
                        return b[args.key] > a[args.key];
                    }
                })

                return separateDessertCollection;
            }

            return dessertCollection;
        },
    },

    Mutation: {
        addDessert: (parent: any, args: any, context: any, info: any) => {
            const dessert = args.dessert as Dessert;
            dessert.id = dessertIdIterator;
            dessertIdIterator++;
            dessertCollection.push(dessert);

            return dessert;
        },

        deleteDessert: (parent: any, args: any, context: any, info: any) => {
            let deleted = false;

            let deletedDesserts: Dessert[] = [];

            for (let i = 0; i < dessertCollection.length; i++) {
                if ((args.id as string[]).includes(dessertCollection[i].id.toString())) {
                    deletedDesserts.push(dessertCollection[i]);
                    dessertCollection.splice(i, 1);
                }
            }

            return deletedDesserts;
        },

        reset: (parent: any, args: any, context: any, info: any) => {
            dessertCollection = [];
            dessertIdIterator = 0;

            return dessertCollection;
        }
    }
};

const server = new ApolloServer({typeDefs, resolvers});

const app = express();

app.use(cors());

server.applyMiddleware({app});

app.listen({port: 4000}, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);
