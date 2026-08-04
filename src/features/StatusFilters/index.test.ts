import type { Show } from "@/api/types";
import { filterShowsByStatus } from "@/features/StatusFilters";

function makeShow(id: number, status: Show["status"]): Show {
  return {
    id,
    name: `Show ${id}`,
    status,
    genres: [],
    image: null,
    summary: null,
  };
}

const running = makeShow(1, "Running");
const ended = makeShow(2, "Ended");
const tbd = makeShow(3, "To Be Determined");
const shows = [running, ended, tbd];

describe("filterShowsByStatus", () => {
  it("returns all shows when status is empty", () => {
    expect(filterShowsByStatus(shows, [])).toEqual(shows);
  });

  it("returns only shows matching a single status", () => {
    expect(filterShowsByStatus(shows, ["Running"])).toEqual([running]);
  });

  it("returns shows matching any of multiple statuses", () => {
    expect(filterShowsByStatus(shows, ["Running", "Ended"])).toEqual([
      running,
      ended,
    ]);
  });

  it("returns an empty array when no show matches the selected statuses", () => {
    expect(filterShowsByStatus([running, ended], ["To Be Determined"])).toEqual(
      [],
    );
  });

  it("returns an empty array when there are no shows", () => {
    expect(filterShowsByStatus([], ["Running"])).toEqual([]);
  });
});
