import { createAuth } from '@keystone-next/auth';
import { config, createSchema } from '@keystone-next/keystone/schema';
import {
  withItemData,
  statelessSessions,
} from '@keystone-next/keystone/session';
import { User } from './schemas/User';
import { Product } from './schemas/Product';
import { ProductImage } from './schemas/ProductImage';
import 'dotenv/config';
import { insertSeedData } from './seed-data';

const databaseURL =
  process.env.DATABASE_URL || 'mongodb://localhost/keystone-sick-fits-tutorial';

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 360, // how long should user stay signed in
  secret: process.env.COOKIE_SECRET,
};

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    // TODO: add in initial roles
  },
});

export default withAuth(
  config({
    server: {
      cors: {
        origin: [process.env.FRONTEN_URL],
        credentials: true,
      },
    },
    db: {
      adapter: 'mongoose',
      url: databaseURL,
      async onConnect(keystone) {
        console.log('connected');
        if (process.argv.includes('--seed-data')) {
          await insertSeedData(keystone);
        }
      },
      // todo add data seeding
    },
    lists: createSchema({
      // schema items here
      User,
      Product,
      ProductImage,
    }),
    ui: {
      // show ui for people who pass test
      isAccessAllowed: ({ session }) => !!session?.data,
    },
    // todo: add session values
    session: withItemData(statelessSessions(sessionConfig), {
      // graphql query
      User: 'id name email',
    }),
  })
);
