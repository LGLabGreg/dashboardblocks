import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { layoutEvents } from './calendar'

const at = (hour: number, minute = 0) => new Date(Date.UTC(2026, 8, 28, hour, minute))

const event = (id: string, start: Date, end: Date) => ({ end, id, start, title: id })

const layout = (events: ReturnType<typeof event>[]) =>
  Object.fromEntries(
    layoutEvents(events).map(({ event, span, uncoveredMinutes }) => [
      event.id,
      [span, uncoveredMinutes],
    ]),
  )

describe('layoutEvents', () => {
  it('stretches an event under a later one and says how long its text is uncovered', () => {
    assert.deepEqual(
      layout([
        event('roadmap', at(9, 30), at(10, 30)),
        event('critique', at(10), at(11)),
      ]),
      { critique: [1, Infinity], roadmap: [2, 30] },
    )
  })

  it('counts the uncovered time to the first event it stretches under', () => {
    assert.deepEqual(
      layout([
        event('long', at(9), at(10, 30)),
        event('middle', at(10, 5), at(11)),
        event('right', at(9, 45), at(10, 15)),
      ]),
      { long: [3, 45], middle: [1, Infinity], right: [1, Infinity] },
    )
    assert.deepEqual(
      layout([
        event('long', at(9), at(10, 30)),
        event('first', at(9), at(9, 30)),
        event('next', at(10, 5), at(11)),
        event('later', at(10, 20), at(11)),
      ]),
      {
        first: [2, Infinity],
        later: [1, Infinity],
        long: [1, Infinity],
        next: [1, Infinity],
      },
    )
  })

  it("doesn't stretch an event under one that starts within its first 30 minutes", () => {
    assert.deepEqual(layout([event('a', at(9), at(10)), event('b', at(9, 20), at(10))]), {
      a: [1, Infinity],
      b: [1, Infinity],
    })
  })
})
