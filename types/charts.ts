export const totalPortfolio = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    datalabels: {
      color: "#000",
      font: { size: 12 },
    },
  },
};

export const portfolioValue = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    datalabels: {
      color: "#000",
      font: { size: 12 },
      formatter: (value: number, context: any) => {
        const dataset = context.chart.data.datasets[0].data.map(
          (val: number) => (typeof val === "number" && !isNaN(val) ? val : 0)
        );
        const total = dataset.reduce(
          (acc: number, curr: number) => acc + curr,
          0
        );
        if (total === 0 || value === 0 || isNaN(value)) return "";
        return ((value / total) * 100).toFixed(1) + "%";
      },
    },
  },
};
