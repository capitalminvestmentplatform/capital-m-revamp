import { portfolioValue, totalPortfolio } from "@/types/charts";
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar, Pie } from "react-chartjs-2";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  ChartDataLabels
);

interface ChartsProps {
  type: "Bar" | "Pie";
  dataset1: any; // Replace 'any' with the appropriate type for dataset
  dataset2?: any; // Replace 'any' with the appropriate type for dataset
  labels: string[]; // Add the 'labels' property with an appropriate type
  colors?: string[]; // Add the 'labels' property with an appropriate type
}

const Charts = ({ type, dataset1, dataset2, labels, colors }: ChartsProps) => {
  if (type === "Bar") {
    return (
      <Bar
        options={totalPortfolio}
        style={{ height: "400px" }}
        data={{
          labels: labels,
          datasets: [
            {
              label: dataset1.label,
              data: dataset1.data,
              borderColor: "#386264",
              backgroundColor: "#386264",
            },
            {
              label: dataset2.label,
              data: dataset2.data,
              borderColor: "#C53030",
              backgroundColor: "#C53030",
            },
          ],
        }}
      />
    );
  }
  if (type === "Pie") {
    return (
      <Pie
        options={portfolioValue}
        style={{ height: "350px" }}
        data={{
          labels: labels,
          datasets: [
            {
              data: dataset1.data,
              backgroundColor: colors,
            },
          ],
        }}
      />
    );
  }
  return;
};

export default Charts;
