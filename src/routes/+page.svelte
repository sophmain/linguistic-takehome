<script lang="ts">
	import { cacheExchange, createClient, fetchExchange, gql, queryStore } from '@urql/svelte';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import Loader from 'components/Loader.svelte';
	import User from 'components/User.svelte';
	import type { UserType } from 'lib/types';

	const client = createClient({
		url: '/graphql',
		exchanges: [cacheExchange, fetchExchange]
	});

	const take: number = 10; //number to fetch in each request
	let skip: number = 0; //number to skip for slice in server query
	let isLoading: boolean = false; //if loading is happening
	let hasMoreUsers: boolean = true; //if there are more users to fetch
	const allUsers = writable<UserType[]>([]); //store to append 10 users every fetch without being overwritten

	let search: string = null;

	// fetch the initial set of users
	onMount(() => {
		executeQuery();
	});

	// event listener for scrolling, called in the outer div
	// async to wait for scroll-triggered executeQuery function to return

	const loadMoreUsers = async (e: Event) => {
		const target = e.target;

		// compare in view pixels + already scrolled pixels to entire scroll height to see if at bottom
		if (target.offsetHeight + target.scrollTop >= target.scrollHeight) {

			// update the skip for pagination
			if (isLoading || !hasMoreUsers) return;
			isLoading = true;
			skip += take;
			await executeQuery();
		}
	};

	// query takes in our skip and take variables to be used in query slice function

	const executeQuery = async () => {

		// reset after search is made/deleted
		if (search === ''){
			skip = 0;
			search = null;
			allUsers.set([]);
			hasMoreUsers = true;
		}

		// create query store
		const query = queryStore<{ users: UserType[] }>({
			client,
			query: gql`
				query($skip: Int!, $take: Int!, $search: String) {
					users(skip: $skip, take: $take, search: $search) {
						id
						name
						avatar
						email
					}
				}
			`,
			variables: { skip, take, search }
		});
		// subscribe to the query store to recieve query result
		// if the result is available, update the allUsers store with the new users
		// if the number of fetched users is less than `take`, set `hasMoreUsers` to false
		// subscribe method has an unsubscribe function to stop further updates (used for cleanup)

		const { unsubscribe } = query.subscribe((data) => {
			if (data && data.data) {
				const newUsers = data.data.users;
				if (search === null) {
					// filter out existing users so dont get key error (dubplicates)
					allUsers.update((users) => {
						const newUniqueUsers = newUsers.filter(
							(newUser) => !users.find((user) => user.id === newUser.id)
						);
						return users.concat(newUniqueUsers);
					});
				} else {
					allUsers.set(newUsers);
				}
				if (newUsers.length < take) {
					hasMoreUsers = false;
				}
			}
		});

		//aesthetic delay to see loading circle
		await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay for 1000 milliseconds to show loading circle
		isLoading = false;
		return () => unsubscribe();
	};
</script>

<div class="w-full h-full">
	<div class="search-bar">
		<input type="text" bind:value={search} on:input={executeQuery} placeholder="Search by name" />
	</div>
	<div class="w-full h-full overflow-scroll" on:scroll={loadMoreUsers}>
		<div class="flex flex-col gap-4 items-center p-4">
			{#each $allUsers as user (user.id)}
				<User {user} />
			{/each}
			{#if isLoading && hasMoreUsers}
				<Loader />
			{/if}
		</div>
	</div>
</div>
