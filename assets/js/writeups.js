document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('writeUpsContainer');

    async function fetchMarkdownImage(fileUrl, filePath) {
        const rawMdUrl = fileUrl.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
        try {
            const res = await fetch(rawMdUrl);
            const text = await res.text();
            const match = text.match(/!\[.*?\]\((.*?)\)/);
            if (match) {
                let imagePath = match[1];
                if (imagePath.startsWith('http')) {
                    return imagePath; // Full image URL
                } else {
                    // Convert relative path to absolute raw GitHub image URL
                    return `https://raw.githubusercontent.com/raoliver92/CTF-Randomness/refs/heads/main/${imagePath}`.replace(/\/\.\.\//g, '/');
                }
            }
        } catch (e) {
            console.error("Failed to fetch markdown content:", e);
        }
        return null;
}


    async function loadWriteUps() {
        const apiUrl = "https://api.github.com/repos/raoliver92/CTF-Randomness/contents/WriteUps";
        try {
            const res = await fetch(apiUrl);
            const data = await res.json();

            const markdownFiles = data
                .filter(item => item.name.endsWith('.md'))
                .slice(0, 4);

            for (const file of markdownFiles) {
                const title = file.name
                    .replace(/\.md$/, '')
                    .replace(/[-_]/g, ' ')
                    .replace(/\b\w/g, char => char.toUpperCase());
                const url = file.html_url;
                const imageUrl = await fetchMarkdownImage(file.html_url, file.path);
                const fallbackImage = `https://via.placeholder.com/400x200.png?text=${encodeURIComponent(title)}`;
                const previewImage = imageUrl || fallbackImage;

                const card = document.createElement('div');
                card.className = 'write-up-summary';
                card.innerHTML = `
                    <a href="${url}" target="_blank">
                        <img src="${previewImage}" alt="${title}">
                        <h2>${title}</h2>
                    </a>
                `;
                container.appendChild(card);
            }
        } catch (e) {
            container.innerHTML = '<p style="color: white;">Failed to load write-ups.</p>';
            console.error("GitHub API error:", e);
        }
    }

    loadWriteUps();
});