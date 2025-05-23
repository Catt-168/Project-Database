import { Box, Slider, TextField, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import * as React from "react";
import { useEffect, useState } from "react";
import { SERVER } from "../../../constants";
import { Colors } from "../../../helpers/constants";
import restClient from "../../../helpers/restClient";
import useAuth from "../../hooks/useAuth";
import AdminNavigation from "../../Navigation/AdminNavigation";

const PIE_SLIDER_MIN = 10;

export default function Dashboard() {
  const { user, isAdmin } = useAuth();

  const [summary, setSummary] = useState({});

  const [pieData, setPieData] = useState([]);
  const [pieDataCount, setPieDataCount] = useState(10);

  const [purchasedMovieCount, setPurchasedMovieCount] = useState(0); // tpm limit
  const [barChartCount, setBarChartCount] = useState(10); // bar chart count for backend tpm
  const [secBarChartCount, setSecBarChartCount] = useState(10);
  const [userCount, setUserCount] = useState(0);
  const [bcX, setBcX] = useState([]); // x-axis
  const [bcY, setBcY] = useState([]); // y-axis

  const [customerX, setCustomerX] = useState([]);
  const [customerY, setCustomerY] = useState([]);

  async function fetchPieData() {
    const response = await restClient.get(
      `${SERVER}/dashboard/getPieChartData`
    );

    setPieData(response.data.pieData);
    setSummary(response.data.summary);
  }

  async function fetchBarChartData() {
    const response = await restClient.get(
      `${SERVER}/dashboard/getBarChartData/${barChartCount}`
    );
    // setBarchData(response.data.barChartData);
    setPurchasedMovieCount(response.data.totalCount);

    setBcX(response.data.barChartData.map((item) => item[0]));
    setBcY(response.data.barChartData.map((item) => item[1]));
  }

  async function fetchHighestCustomerData() {
    try {
      const response = await restClient.get(
        `${SERVER}/dashboard/getHighestPurchasedUsers/${secBarChartCount}`
      );
      console.log("customer", response.data);
      setUserCount(response.data.totalCount);
      setCustomerX(
        response.data.customers.map((item) => {
          return item[0];
        })
      );
      setCustomerY(response.data.customers.map((item) => item[1]));
    } catch (e) {
      console.log("e", e.response.data);
    }
  }

  useEffect(() => {
    fetchPieData();
    fetchBarChartData();
    fetchHighestCustomerData();
  }, []);

  const sortedPieData = pieData
    ?.sort((a, b) => b.value - a.value)
    .slice(0, pieDataCount);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      fetchBarChartData();
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AdminNavigation />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box
          sx={{
            display: "flex",
            ml: 2.5,
            flexDirection: "row",
            mt: 9.5,
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box
            sx={{
              width: 200,
            }}
          >
            <Typography
              id="input-item-number"
              gutterBottom
              sx={{
                background: Colors.primary,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
                color: Colors.textWhite,
                fontWeight: "bold",
                fontSize: 17,
                mr: 2,
              }}
            >
              Movies : {summary?.movies}
            </Typography>

          </Box>
          <Box sx={{ width: 200 }}>
            <Typography
              id="input-item-number"
              gutterBottom
              sx={{
                background: Colors.primary,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
                color: Colors.textWhite,
                fontWeight: "bold",
                fontSize: 17,
                mr: 2,
              }}
            >
              Genres : {summary?.genre}
            </Typography>
          </Box>
          <Box sx={{ width: 200 }}>
            <Typography
              id="input-item-number"
              gutterBottom
              sx={{
                background: Colors.primary,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
                color: Colors.textWhite,
                fontWeight: "bold",
                fontSize: 17,
                mr: 2,
              }}
            >
             Languages : {summary?.language}
            </Typography>

          </Box>
          <Box sx={{ width: 200 }}>
            <Typography
              id="input-item-number"
              gutterBottom
              sx={{
                background: Colors.primary,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
                color: Colors.textWhite,
                fontWeight: "bold",
                fontSize: 17,
                mr: 2,
              }}
            >
              Users : {summary?.users}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
          }}
        >
          <Box
            sx={{
              padding: "0.5rem 1rem 0.5rem 1rem",
              ml: 2.5,
              border: "1px solid #D3D3D3",
              borderRadius: 2,
              maxHeight: 500,
            }}
          >
            <Typography id="input-item-number" gutterBottom fontSize={13}>
              Number of items
            </Typography>
            <Slider
              value={pieDataCount}
              onChange={(e, newValue) => setPieDataCount(newValue)}
              valueLabelDisplay="auto"
              min={PIE_SLIDER_MIN}
              max={pieData.length - 1}
              aria-labelledby="input-item-number"
            />
            <PieChart
              colors={colors}
              series={[
                {
                  data: sortedPieData,
                  highlightScope: { faded: "global", highlighted: "item" },
                  faded: {
                    innerRadius: 30,
                    additionalRadius: -30,
                    color: "gray",
                  },
                  // outerRadius: 100,
                  // cx: pieDataCount <= 14 ? 240 : 160,
                  cx: 330,
                  // cy: 100,
                },
              ]}
              width={
                // pieDataCount >= 10 ? (pieDataCount >= 18 ? 550 : 480) : 360
                500
              }
              height={330}
              slotProps={{
                legend: {
                  // direction: "row",
                  position: { horizontal: "left" },
                  padding: 0,
                  labelStyle: {
                    fontSize: 12,
                  },
                  itemMarkWidth: 6,
                  itemMarkHeight: 6,
                },
              }}
            />
            <Typography
              fontSize={20}
              color={Colors.primary}
              mt={2}
              fontWeight={"bold"}
            >
              Top Movies by Genre
            </Typography>
          </Box>

          <Box
            sx={{
              padding: "1rem",
              ml: 2.5,
              border: "1px solid #D3D3D3",
              borderRadius: 2,
              maxHeight: 500,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-around" }}>
              <TextField
                id="outlined-controlled"
                label={"Bar Chart Count"}
                value={barChartCount}
                onChange={(event) => {
                  setBarChartCount(event.target.value);
                }}
                onKeyDown={handleKeyDown}
                size="small"
              />
              <p
                style={{ fontSize: 14 }}
              >{`Maximum Count ${purchasedMovieCount}`}</p>
            </Box>
            <BarChart
              xAxis={[
                {
                  scaleType: "band",
                  data: bcX,
                  tickLabelStyle: {
                    textAnchor: "start",
                    fontSize: 11,
                    angle: 50,
                  },
                },
              ]}
              series={[
                {
                  data: bcY,
                },
              ]}
              width={
                // pieDataCount >= 10 ? (pieDataCount >= 18 ? 400 : 480) : 600
                480
              }
              height={335}
              colors={colors}
            />
            <Typography
              fontSize={20}
              color={Colors.primary}
              mt={2}
              fontWeight={"bold"}
            >
              Top Purchased Movies
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              padding: "1rem",
              ml: 2.5,
              mt: 1.5,
              border: "1px solid #D3D3D3",
              borderRadius: 2,
              maxHeight: 450,
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-around" }}>
              <TextField
                id="outlined-controlled"
                label={"Bar Chart Count"}
                value={secBarChartCount}
                onChange={(event) => {
                  setSecBarChartCount(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    fetchHighestCustomerData();
                  }
                }}
              />
              <p>{`Maximum Count ${userCount}`}</p>
            </Box>
            <BarChart
              xAxis={[
                {
                  scaleType: "band",
                  data: customerX,
                  tickLabelStyle: {
                    textAnchor: "start",
                    fontSize: 11,
                    angle: 50,
                  },
                  categoryGapRatio: 0.2,
                },
              ]}
              series={[
                {
                  data: customerY,
                },
              ]}
              width={500}
              height={310}
              colors={colors}
            />
            <Typography
              fontSize={20}
              color={Colors.primary}
              mt={2}
              fontWeight={"bold"}
            >
              Highest Purchased Customers
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

const colors = [
  Colors.primary,
  Colors.secondary,
  Colors.yellow,
  "#FF5733", // Red-Orange
  "#33FF57", // Green
  "#3357FF", // Blue
  "#FF33A8", // Pink
  "#FFD733", // Yellow
  "#33FFF3", // Cyan
  "#8A33FF", // Purple
  "#FF8333", // Orange
  "#33FF83", // Light Green
  "#3383FF", // Light Blue
  "#FF3383", // Magenta
  "#FFF333", // Light Yellow
  "#33FFF8", // Light Cyan
  "#8333FF", // Violet
  "#FF338A", // Dark Pink
  "#33FFD7", // Aqua
  "#D733FF", // Deep Purple
  "#FF5733", // Coral
  "#33FF8A", // Mint
];
