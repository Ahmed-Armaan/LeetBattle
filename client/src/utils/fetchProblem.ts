export function FetchProblem(
	slug: string,
	setTitileContext: (title: string) => void,
	setDescriptionContext: (desc: string) => void
) {
	fetchProblemReq(slug)
		.then((problem) => {
			setTitileContext(problem.title);
			setDescriptionContext(problem.descriptionHtml);
		})
		.catch(err => console.log(err));
}

async function fetchProblemReq(slug: string) {
	const response = await fetch("https://leetcode.com/graphql", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Referer": `https://leetcode.com/problems/${slug}/`,
		},
		body: JSON.stringify({
			query: `
        query getQuestionDetail($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            questionId
            title
            content
            difficulty
            likes
            dislikes
            exampleTestcases
          }
        }
      `,
			variables: {
				titleSlug: slug
			}
		})
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch problem: ${response.statusText}`);
	}

	const json = await response.json();
	const data = json.data?.question;

	if (!data) {
		throw new Error("Problem not found.");
	}

	return {
		title: data.title,
		descriptionHtml: data.content,
	};
};

//fetchProblemDescription("two-sum")
//	.then(problem => console.log(problem))
//	.catch(err => console.error(err));
