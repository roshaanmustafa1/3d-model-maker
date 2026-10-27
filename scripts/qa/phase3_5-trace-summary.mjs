import JSZip from 'jszip'
import { readFile } from 'node:fs/promises'
const zip = await JSZip.loadAsync(await readFile(process.argv[2]))
for (const entry of Object.values(zip.files).filter(file => file.name.endsWith('.trace'))) {
  const records = (await entry.async('string')).split('\n').filter(Boolean).map(line => JSON.parse(line))
  console.log(entry.name)
  for (const record of records.filter(record => record.messageType === 'error' || record.type === 'event' || record.error).slice(-45)) console.log(JSON.stringify(record).slice(0, 900))
}
