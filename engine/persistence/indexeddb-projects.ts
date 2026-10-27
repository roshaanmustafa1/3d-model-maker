import type { ProjectDocument, ProjectSnapshot } from './project-assets'

const DATABASE = '3d-model-maker-assets'
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('IndexedDB is unavailable; this project cannot be saved durably.')); return }
    const request = indexedDB.open(DATABASE, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore('projects', { keyPath: 'metadata.id' })
      request.result.createObjectStore('assets')
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    request.onblocked = () => reject(new Error('Project storage upgrade blocked by another tab. Close the other editor tab and retry.'))
  })
}

export function saveProjectSnapshot(snapshot: ProjectSnapshot): Promise<void> {
  return openDatabase().then((db) => new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(['projects', 'assets'], 'readwrite')
    const projects = transaction.objectStore('projects'), assets = transaction.objectStore('assets')
    const previous = projects.get(snapshot.document.metadata.id)
    previous.onsuccess = () => {
      const old = previous.result as ProjectDocument | undefined
      if (old && old.assetId !== snapshot.document.assetId) assets.delete(old.assetId)
      assets.put(snapshot.assets, snapshot.document.assetId)
      projects.put(snapshot.document)
    }
    transaction.oncomplete = () => { db.close(); resolve() }
    transaction.onabort = transaction.onerror = () => { db.close(); reject(transaction.error || new Error('Project save failed; the previous saved version remains intact.')) }
  }))
}

export function readProjectSnapshot(id: string): Promise<ProjectSnapshot> {
  return openDatabase().then((db) => new Promise<ProjectSnapshot>((resolve, reject) => {
    const transaction = db.transaction(['projects', 'assets'], 'readonly')
    let snapshot: ProjectSnapshot | undefined
    let failure: Error | undefined
    const request = transaction.objectStore('projects').get(id)
    request.onsuccess = () => {
      const document = request.result as ProjectDocument | undefined
      if (!document) { failure = new Error(`Saved project ${id} was not found.`); return }
      const asset = transaction.objectStore('assets').get(document.assetId)
      asset.onsuccess = () => {
        if (!asset.result) failure = new Error(`Missing project asset bundle ${document.assetId}; no substitute geometry was loaded.`)
        else snapshot = { document, assets: asset.result }
      }
    }
    transaction.oncomplete = () => { db.close(); if (snapshot) resolve(snapshot); else reject(failure || new Error('Project assets could not be read.')) }
    transaction.onabort = transaction.onerror = () => { db.close(); reject(transaction.error) }
  }))
}

export function deleteProjectSnapshot(id: string): Promise<void> {
  return openDatabase().then((db) => new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(['projects', 'assets'], 'readwrite')
    const request = transaction.objectStore('projects').get(id)
    request.onsuccess = () => {
      if (request.result) transaction.objectStore('assets').delete(request.result.assetId)
      transaction.objectStore('projects').delete(id)
    }
    transaction.oncomplete = () => { db.close(); resolve() }
    transaction.onabort = transaction.onerror = () => { db.close(); reject(transaction.error) }
  }))
}
