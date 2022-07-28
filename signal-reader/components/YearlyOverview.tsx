import { useRouter } from "next/router";
import { useEffect, useState } from "react";
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

import { DateTime } from "luxon";

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

const toDay = (unix: number) =>
  DateTime.fromMillis(unix).toFormat("dd.MM.yyyy");

function YearlyOverview({ conversationId }: any) {
  const [conversation, setConversation] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const res = await axios.get(`/api/frequency/${conversationId}/`);

      setConversation(res.data.data);
    })();
  }, []);

  if (!conversation) return null;

  return (
    <Bar
      data={{
        labels: Object.keys(conversation.days),
        datasets: [
          {
            label: `Amount of Messages exchanged with ${conversation.name}`,
            data: Object.values(conversation.days),
            backgroundColor: ["#7caaab", "#67b6b9", "#51c0c4", "#2fc9d4"],
            borderColor: ["none"],
            borderWidth: 0,
          },
        ],
      }}
    />
  );
}
export default YearlyOverview;
