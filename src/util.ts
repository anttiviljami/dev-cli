import _ = require('lodash')
import {IConfig} from '@oclif/config'
import {tsPath} from '@oclif/config/lib/ts-node'

export function castArray<T>(input?: T | T[]): T[] {
  if (input === undefined) return []
  return Array.isArray(input) ? input : [input]
}

export function uniqBy<T>(arr: T[], fn: (cur: T) => any): T[] {
  return arr.filter((a, i) => {
    const aVal = fn(a)
    return !arr.find((b, j) => j > i && fn(b) === aVal)
  })
}

export function compact<T>(a: (T | undefined)[]): T[] {
  return a.filter((a): a is T => Boolean(a))
}

export function sortBy<T>(arr: T[], fn: (i: T) => sort.Types | sort.Types[]): T[] {
  function compare(a: sort.Types | sort.Types[], b: sort.Types | sort.Types[]): number {
    a = a === undefined ? 0 : a
    b = b === undefined ? 0 : b

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length === 0 && b.length === 0) return 0
      const diff = compare(a[0], b[0])
      if (diff !== 0) return diff
      return compare(a.slice(1), b.slice(1))
    }

    if (a < b) return -1
    if (a > b) return 1
    return 0
  }

  return arr.sort((a, b) => compare(fn(a), fn(b)))
}

export namespace sort {
  export type Types = string | number | undefined | boolean
}

export const template = (context: any) => (t: string | undefined): string => _.template(t || '')(context)

export function extractPlugin(config: IConfig, pluginPath: string): any {
  const helpPlugin = tsPath(config.root, pluginPath)
  return require(helpPlugin) as any
}

export function extractExport(exported: any): any {
  return exported && exported.default ? exported.default : exported
}

export function getHelpPlugin(config: IConfig, defaultPlugin = '@oclif/plugin-help'): any {
  const pjson = config.pjson
  const configuredPlugin = pjson && pjson.oclif && pjson.oclif.helpPlugin

  if (configuredPlugin) {
    try {
      const exported = extractPlugin(config, configuredPlugin)
      return extractExport(exported)
    } catch (error) {
      throw new Error(`Unable to load configured help plugin "${configuredPlugin}" from package.json, failed with message:\n${error.message}`)
    }
  }

  try {
    const exported = require(defaultPlugin)
    return extractExport(exported)
  } catch (error) {
    throw new Error(`Could not load a help plugin, consider installing the @oclif/plugin-help package, failed with message:\n${error.message}`)
  }
}
