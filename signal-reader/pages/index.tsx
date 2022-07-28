import { useEffect, useRef, useState } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

import Chart from "chart.js/auto";

import axios from "axios";

Chart.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Page() {
  const [conversations, setConversations] = useState<any>([]);

  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    (async () => {
      const res = await axios.get("/api/conversations/");

      setConversations(res.data.data);
    })();
  }, []);

  const footer = (tooltipItems: any) => {
    const item = tooltipItems[0];

    return item.label;

    return <a href={`/chat/${item.label}`}>{item.label}</a>;
  };

  const validConversations = conversations
    .filter((i) => i.name != null)
    .map((i) => ({
      ...i,
      ...JSON.parse(i.json),
    }));

  const messageCountByUser = validConversations.reduce(
    (prev, i) => ({ ...prev, [i.name]: i.messageCount }),
    {}
  );

  return (
    <>
      <Bar
        ref={chartRef}
        data={{
          labels: validConversations.map((i) => i.name),
          datasets: [
            {
              label: "All Conversations",
              data: validConversations.map(
                (i) => JSON.parse(i.json).messageCount
              ),
              backgroundColor: ["#7caaab", "#67b6b9", "#51c0c4", "#2fc9d4"],
              borderColor: ["none"],
              borderWidth: 0,
            },
          ],
        }}
        options={{
          onClick: function (c, i) {
            console.log({ c, i });

            const e = i[0] as any;
            console.log(e);
          },

          interaction: {
            intersect: false,
            mode: "index",
          },
          plugins: {
            legend: {
              onClick: () => {
                console.log("hi");
              },
            },
            tooltip: {
              callbacks: {
                footer: footer,
              },
            },
          },
        }}
      />

      <div style={{ width: "33vw", height: "33vw" }}>
        <Doughnut
          data={{
            labels: Object.keys(messageCountByUser),
            datasets: [
              {
                label: "Die Sache",
                data: Object.values(messageCountByUser),
                backgroundColor: ["#7caaab", "#67b6b9", "#51c0c4", "#2fc9d4"],
                hoverOffset: 4,
              },
            ],
          }}
        />
      </div>
    </>
  );
}
export default Page;
