function PageTable({ pages }) {
  if (!pages || pages.length === 0) {
    return <p style={{ color: "#aaa", padding: "1rem" }}>No pages found.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>URL</th>
          <th>Title</th>
          <th>Status</th>
          <th>Links</th>
          <th>Crawled At</th>
          <th>Error</th>
        </tr>
      </thead>
      <tbody>
        {pages.map((page) => (
          <tr key={page.id}>
            <td>{page.id}</td>
            <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <a href={page.url} target="_blank" rel="noreferrer"
                style={{ color: "#4a90e2", textDecoration: "none" }}
                onClick={(e) => e.stopPropagation()}
              >
                {page.url}
              </a>
            </td>
            <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {page.title || "—"}
            </td>
            <td>
              <span style={{ color: page.status_code === 200 ? "#16a34a" : "#dc2626", fontWeight: "600" }}>
                {page.status_code || "—"}
              </span>
            </td>
            <td>{page.outbound_links}</td>
            <td>{new Date(page.crawled_at).toLocaleString()}</td>
            <td style={{ color: "#dc2626", fontSize: "0.8rem" }}>{page.error || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default PageTable;
