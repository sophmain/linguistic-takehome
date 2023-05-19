# The Linguistic Full Stack Challenge

To lazy load 10 users at a time, the number of users already fetched is kept track by a 'skip' variable, and the number of users to fetch is kept track by the const variable 'take'.

When a user scrolls to the bottom of the list, a scroll event listener is triggered called 'loadMoreUsers'. This function increments 'skip' and executes the query function 'executeQuery' to append the next 10 users to the list (allUsers store).

If a user types in the search box, that string is used to query for matching users that contain the string in their name. If the search is deleted, variables are reset to show the first 10 users, then load users 10 at a time like normal.
