export default function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;

  const items = [];
  for (let i = 1; i <= pages; i++) items.push(i);

  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onPage(page - 1)} disabled={page === 1}>‹</button>
      {items.map((p) => (
        <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onPage(p)}>{p}</button>
      ))}
      <button className="page-btn" onClick={() => onPage(page + 1)} disabled={page === pages}>›</button>
    </div>
  );
}
