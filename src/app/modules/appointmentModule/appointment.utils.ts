export function generateNextAppointmentId(lastAppointmentId: string | null): string {
  const lastNumber = lastAppointmentId ? parseInt(lastAppointmentId.split('-')[1], 10) : 0;

  const nextNumber = (lastNumber + 1).toString().padStart(4, '0');

  return `APPO-${nextNumber}`;
}
