let companyName = 'Amazon';
const solutions = [] as { id: number, title: string, score: number, url: string }[];

function main() {
    chrome.storage.local.get('clickedCompany', function (data: { [key: string]: any; }) {
        companyName = data.clickedCompany;
        const title: HTMLElement | null = document.getElementById('title');
        if (title) title.textContent = companyName;
        document.title = companyName + ` Questions`;
        addCompanyProblems('Score');
    });

    document.getElementById('#')?.addEventListener('click', () => sortBy('#'));
    document.getElementById('Title')?.addEventListener('click', () => sortBy('Title'));
    document.getElementById('Score')?.addEventListener('click', () => sortBy('Score'));
}

interface Company {
    name: string;
    score: number;
}

interface Question {
    title: string;
    frontend_id: number;
    companies?: Company[];
}

interface LeetcodeProblems {
    questions: Question[];
}
function addCompanyProblems(sortMethod: string) {
    chrome.storage.local.get('leetcodeProblems', function (items: { [key: string]: any; }) {
        const data = items as { leetcodeProblems: LeetcodeProblems };
        data.leetcodeProblems.questions.forEach((question: Question) => {
            if (!question.companies) return;
            question.companies.forEach((company: Company) => {
                if (company.name === companyName) {
                    solutions.push({
                        id: question.frontend_id,
                        title: question.title,
                        score: company.score,
                        url: `https://leetcode.com/problems/${question.title.replace(/\s/g, '-')}/`,
                    });
                }
            });
        });

        const table = document.getElementById('solutionTable') as HTMLTableElement;

        if (sortMethod === 'Score') {
            solutions.sort((a, b) => b.score - a.score);
        }

        solutions.forEach(solution => {
            const row = table.insertRow(-1);
            row.insertCell(0).innerText = solution.id.toString();
            const titleCell = row.insertCell(1);
            titleCell.innerHTML = `<a href="${solution.url}" target="_blank">${solution.title}</a>`;
            row.insertCell(2).innerText = solution.score.toString();
        });
    });
}

function sortBy(column: string) {
    if (column === 'Score') {
        solutions.sort((a, b) => b.score - a.score);
    }
    else if (column === 'Title') {
        solutions.sort((a, b) => a.title.localeCompare(b.title));
    }
    else {
        solutions.sort((a, b) => a.id - b.id);
    }

    // after sorting, you might want to re-render your table
    const table = document.getElementById('solutionTable') as HTMLTableElement;

    // remove all existing rows
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // add sorted rows
    solutions.forEach(solution => {
        const row = table.insertRow(-1);
        row.insertCell(0).innerText = solution.id.toString();
        const titleCell = row.insertCell(1);
        titleCell.innerHTML = `<a href="${solution.url}" target="_blank">${solution.title}</a>`;
        row.insertCell(2).innerText = solution.score.toString();
    });
}

/* Run the script */
main();
