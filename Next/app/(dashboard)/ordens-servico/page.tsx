// trecho alterado apenas no card
<article ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`kanban-card ${snapshot.isDragging ? 'kanban-card-dragging' : ''}`}>
  <div className="d-flex justify-content-between gap-2">
    <strong className="text-truncate">{order.title}</strong>
    <span className="badge bg-warning text-dark">{order.priority}</span>
  </div>

  <small className="d-block text-muted mt-1 text-truncate">
    👤 {order.customer?.name || 'Sem cliente'}
  </small>

  <small className="d-block text-muted text-truncate">
    🛠 {order.responsibleEmployee?.name || 'Sem responsável'}
  </small>

  {order.description && (
    <small className="d-block mt-1 text-muted text-truncate">
      📝 {order.description}
    </small>
  )}

  <div className="d-flex justify-content-between align-items-center mt-2">
    <span className="fw-semibold">R$ {Number(order.total || 0).toFixed(2)}</span>
    <span className="badge bg-secondary">
      💬 {order.comments?.length || 0}
    </span>
  </div>

  <a className="btn btn-sm btn-outline-primary mt-2 w-100" href={`/ordens-servico/${order.id}`}>
    Abrir OS
  </a>
</article>
