import TeacherGrantsDashboard from "../src/components/dashboard/TeacherGrantsDashboard"
import { loadGrantCsvFromDisk } from "../src/lib/csv-server"

export default async function Page() {
  const records = await loadGrantCsvFromDisk()

  return <TeacherGrantsDashboard records={records} />
}
