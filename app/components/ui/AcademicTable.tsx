import { ReactNode } from "react";

export interface AcademicColumn<T> {
  key: string;
  header: string;
  group?: string;
  verticalHeader?: boolean;
  width?: string;
  cell: (row: T) => ReactNode;
}

interface AcademicTableProps<T> {
  rows: T[];
  columns: AcademicColumn<T>[];
  getRowKey: (row: T) => string | number;
  emptyMessage?: string;
}

interface HeaderGroup {
  title: string;
  colspan: number;
}

function getHeaderGroups<T>(
  columns: AcademicColumn<T>[],
): HeaderGroup[] {
  return columns.reduce<HeaderGroup[]>((groups, column) => {
    const title = column.group ?? "";

    const last = groups.at(-1);

    if (last && last.title === title) {
      last.colspan += 1;
    } else {
      groups.push({
        title,
        colspan: 1,
      });
    }

    return groups;
  }, []);
}

export default function AcademicTable<T>({
  rows,
  columns,
  getRowKey,
  emptyMessage = "No hay datos disponibles",
}: AcademicTableProps<T>) {
  const groups = getHeaderGroups(columns);
  const hasGroupedHeaders = columns.some(
    (column) => Boolean(column.group),
  );

  return (
    <div className="w-full overflow-x-auto rounded-md border border-gray-300 bg-white">
      <table className="min-w-max w-full border-collapse text-sm">
        <thead>
          {hasGroupedHeaders && (
            <tr className="bg-white">
              {groups.map((group, index) => (
                <th
                  key={`${group.title}-${index}`}
                  colSpan={group.colspan}
                  className="border border-gray-300 px-3 py-2 text-center font-semibold"
                >
                  {group.title}
                </th>
              ))}
            </tr>
          )}

          <tr className="bg-[#d7e8ff]">
            {columns.map((column) => (
              <th
                key={column.key}
                className="border border-gray-300 px-2 py-3 text-center font-semibold text-gray-900"
                style={{
                  minWidth: column.width,
                }}
              >
                {column.verticalHeader ? (
                  <span
                    className="inline-block min-h-32 whitespace-nowrap"
                    style={{
                      writingMode: "vertical-rl",
                      transform: "rotate(180deg)",
                    }}
                  >
                    {column.header}
                  </span>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="border border-gray-300 px-4 py-4 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className="hover:bg-gray-50"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="border border-gray-300 px-3 py-2 text-center"
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}