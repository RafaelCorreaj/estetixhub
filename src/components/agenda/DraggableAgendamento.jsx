import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import moment from 'moment';

export default function DraggableAgendamento({ agendamento, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: agendamento.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        if (!isDragging) onClick(agendamento);
      }}
      className="text-xs p-2 mb-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors cursor-grab active:cursor-grabbing"
    >
      <div className="font-medium">{moment(agendamento.data_hora_inicio).format("HH:mm")}</div>
      <div className="truncate">{agendamento.cliente?.nome?.split(" ")[0]}</div>
    </div>
  );
}