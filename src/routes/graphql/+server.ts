import { createYoga, createSchema } from 'graphql-yoga';
import { useGraphQlJit } from '@envelop/graphql-jit';

import type { RequestEvent } from '@sveltejs/kit';

import { users } from '$lib/data';

import schema from '$lib/schema.gql';

const yogaApp = createYoga<RequestEvent>({
	schema: createSchema({
		typeDefs: schema,
		resolvers: {
			Query: {
				users: (source, args, context, info) => {
					try {
					  let {skip, take, searchTerm } = args
					  if (searchTerm) {
						console.log('search term', searchTerm)
						const searchTermLowerCase = searchTerm.toLowerCase();
							let filteredUsers = users.filter((user) =>
								user.name.toLowerCase().includes(searchTermLowerCase)
							);
						return filteredUsers
					  }
					  return users.slice(skip, skip + take)
					} catch (err) {
					  console.error(err);
					  throw err;
					}
				  }
			}
		}
	}),
	plugins: [useGraphQlJit()],
	fetchAPI: globalThis
});

export { yogaApp as GET, yogaApp as POST };
