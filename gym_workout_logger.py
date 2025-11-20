# gym_workout_logger.py
"""
🏋️‍♂️ Gym Workout Logger

Run:
    pip install streamlit pandas altair
    streamlit run gym_workout_logger.py

This app lets you:
- Log workouts with: Date, Exercise, Sets, Reps, Weight (kg)
- See a table of all logged workouts plus calculated Volume (sets × reps × weight)
- Filter by exercise and date range
- See a weekly progress chart (total or per-exercise volume)
- View weekly stats like heaviest weight and total sets/reps

Data is stored in:
- st.session_state (for live interaction)
- A local CSV file (gym_workouts.csv) for simple persistence
"""

from __future__ import annotations

import base64
from datetime import datetime, date, timedelta
from pathlib import Path

import altair as alt
import pandas as pd
import streamlit as st

# ------------------------- Page Config ------------------------- #

st.set_page_config(
    page_title="🏋️‍♂️ Gym Workout Logger",
    layout="wide",
)

# ------------------------- Background Image & Theming ------------------------- #

BACKGROUND_IMAGE_PATH = Path("gym_bg.jpg")  # <--- put your image with this name


def get_base64_image(path: Path) -> str | None:
    """Return base64 string for an image file or None if not available."""
    if not path.exists():
        return None
    try:
        with open(path, "rb") as f:
            return base64.b64encode(f.read()).decode()
    except Exception:
        return None


bg_base64 = get_base64_image(BACKGROUND_IMAGE_PATH)

if bg_base64:
    bg_css = f"""
    .stApp {{
        background: 
            linear-gradient(135deg, rgba(15,23,42,0.92), rgba(8,47,73,0.88)),
            url("data:image/jpg;base64,{bg_base64}") no-repeat center center fixed;
        background-size: cover;
        color: #e5e7eb;
    }}
    """
else:
    # Fallback: gradient only
    bg_css = """
    .stApp {
        background: radial-gradient(circle at top, #020617 0, #020617 35%, #000000 100%) !important;
        color: #e5e7eb;
    }
    """

# Custom CSS: neon / premium gym style
st.markdown(
    f"""
<style>
{bg_css}

/* Hide default header/footer if you want a cleaner look */
header {{visibility: hidden;}}
footer {{visibility: hidden;}}

/* Card-style containers */
.block-card {{
    background: rgba(15, 23, 42, 0.80);
    border-radius: 18px;
    padding: 18px 20px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(56, 189, 248, 0.35);
    backdrop-filter: blur(12px);
}}

/* Main title */
h1 {{
    font-weight: 900 !important;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}}

/* Accent buttons */
.stButton > button {{
    background: linear-gradient(135deg, #22c55e, #06b6d4) !important;
    color: #020617 !important;
    border-radius: 999px !important;
    border: none !important;
    font-weight: 800 !important;
    padding: 0.45rem 1.4rem !important;
    box-shadow: 0 12px 30px rgba(16, 185, 129, 0.35);
}}
.stButton > button:hover {{
    filter: brightness(1.10);
    transform: translateY(-1px);
}}

/* Input fields – text inside fields */
.stTextInput input,
.stNumberInput input,
.stDateInput input {{
    background-color: rgba(15,23,42,0.85) !important;
    color: #ffffff !important;     /* Text inside input fields */
    border-radius: 10px !important;
    border: 1px solid rgba(148,163,184,0.6) !important;
}}

/* Dropdowns */
/* ===== FIX: Selectbox (Exercise etc.) text color ===== */

/* Wrapper background + border */
.stSelectbox div[role="combobox"] {{
    background-color: rgba(15,23,42,0.95) !important;
    border-radius: 10px !important;
    border: 1px solid rgba(148,163,184,0.7) !important;
}}

/* Text inside the select input (selected value like "Bench Press") */
.stSelectbox div[role="combobox"] input {{
    color: #f9fafb !important;      /* Bright visible white */
    font-weight: 600 !important;
}}

/* Placeholder text */
.stSelectbox div[role="combobox"] input::placeholder {{
    color: #9ca3af !important;
}}

/* Dropdown menu items */
.stSelectbox [data-baseweb="menu"] div {{
    background-color: #020617 !important;
    color: #e5e7eb !important;
}}

/* Hover effect */
.stSelectbox [data-baseweb="menu"] div:hover {{
    background-color: #0f172a !important;
}}

}}

/* Dropdown menu items */
.stSelectbox span, .stSelectbox div {{
    color: #e5e7eb !important;
}}

/* FIX label text color */
label, .css-1p3j9i3 {{
    color: #e5e7eb !important;     /* Label text color (Exercise, Sets, Reps, etc.) */
    font-weight: 600 !important;
}}

/* Fix placeholder text color */
input::placeholder {{
    color: #cbd5e1 !important;
}}


/* Sidebar styling */
section[data-testid="stSidebar"] {{
    background: linear-gradient(180deg, #020617 0%, #020617 40%, #020617 100%);
    border-right: 1px solid rgba(148, 163, 184, 0.25);
}}

/* Metric / stat cards */
.metric-card {{
    background: radial-gradient(circle at top left, rgba(34,197,94,0.16), rgba(15,23,42,0.93));
    border-radius: 16px;
    padding: 14px 16px;
    border: 1px solid rgba(56,189,248,0.45);
    box-shadow: 0 18px 40px rgba(0,0,0,0.75);
}}
.metric-label {{
    font-size: 0.8rem;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.12em;
}}
.metric-value {{
    font-size: 1.4rem;
    font-weight: 800;
    color: #e5e7eb;
}}

/* Dataframe style tweaks */
[data-testid="stTable"], .stDataFrame {{
    background: rgba(15, 23, 42, 0.85) !important;
    border-radius: 12px !important;
}}
</style>
""",
    unsafe_allow_html=True,
)

# ------------------------- Constants & Paths ------------------------- #

CSV_PATH = Path("gym_workouts.csv")

DEFAULT_EXERCISES = [
    "Bench Press",
    "Squat",
    "Deadlift",
    "Overhead Press",
    "Barbell Row",
    "Pull-Up",
    "Lat Pulldown",
    "Leg Press",
    "Bicep Curl",
    "Tricep Extension",
]

# ------------------------- State & Data Handling ------------------------- #

def init_state():
    """Initialize session_state with an empty DataFrame or load from CSV."""
    if "workouts_df" not in st.session_state:
        if CSV_PATH.exists():
            try:
                df = pd.read_csv(CSV_PATH, parse_dates=["Date"])
            except Exception:
                df = pd.DataFrame(
                    columns=["Date", "Exercise", "Sets", "Reps", "Weight (kg)", "Volume"]
                )
        else:
            df = pd.DataFrame(
                columns=["Date", "Exercise", "Sets", "Reps", "Weight (kg)", "Volume"]
            )
        st.session_state.workouts_df = df


def save_to_csv():
    """Persist current workouts DataFrame to CSV."""
    st.session_state.workouts_df.to_csv(CSV_PATH, index=False)


def add_workout_entry(entry: dict):
    """
    Add a single workout entry (dict) to session_state DataFrame and persist.
    Entry must contain: Date, Exercise, Sets, Reps, Weight (kg), Volume.
    """
    df = st.session_state.workouts_df
    new_df = pd.concat([df, pd.DataFrame([entry])], ignore_index=True)
    st.session_state.workouts_df = new_df
    save_to_csv()


def load_demo_data():
    """Load some demo data for visualization (overwrites current data)."""
    today = date.today()
    # Create a simple weekly pattern
    demo = []
    demo.append(
        {
            "Date": today - timedelta(days=6),
            "Exercise": "Bench Press",
            "Sets": 4,
            "Reps": 8,
            "Weight (kg)": 60,
        }
    )
    demo.append(
        {
            "Date": today - timedelta(days=4),
            "Exercise": "Bench Press",
            "Sets": 5,
            "Reps": 5,
            "Weight (kg)": 70,
        }
    )
    demo.append(
        {
            "Date": today - timedelta(days=5),
            "Exercise": "Squat",
            "Sets": 4,
            "Reps": 6,
            "Weight (kg)": 80,
        }
    )
    demo.append(
        {
            "Date": today - timedelta(days=2),
            "Exercise": "Squat",
            "Sets": 5,
            "Reps": 5,
            "Weight (kg)": 100,
        }
    )
    demo.append(
        {
            "Date": today - timedelta(days=1),
            "Exercise": "Deadlift",
            "Sets": 3,
            "Reps": 5,
            "Weight (kg)": 110,
        }
    )
    demo.append(
        {
            "Date": today,
            "Exercise": "Deadlift",
            "Sets": 3,
            "Reps": 3,
            "Weight (kg)": 140,
        }
    )

    for d in demo:
        d["Volume"] = d["Sets"] * d["Reps"] * d["Weight (kg)"]

    df_demo = pd.DataFrame(demo)
    st.session_state.workouts_df = df_demo
    save_to_csv()


init_state()

# ------------------------- Sidebar: Instructions ------------------------- #

with st.sidebar:
    st.title("🏋️‍♂️ Logger Guide")
    st.markdown(
        """
**How to log workouts**
1. Fill in:
   - Exercise
   - Sets
   - Reps
   - Weight (kg)
   - Date (defaults to today)
2. Click **Add Workout**

**Progress Graph**
- Shows training **volume** = Sets × Reps × Weight per day.
- Filter by exercise & date range to zoom into specific lifts.

Use:
- **Load Demo Data** to visualize quickly.
- Check stat cards for **heaviest weight** and **total sets/reps** this week.
"""
    )
    st.markdown("---")
    if st.button("📊 Load Demo Data"):
        load_demo_data()
        st.success("Demo data loaded. Scroll down to view the log & charts.")

# ------------------------- Header ------------------------- #

st.markdown(
    "<h1>🏋️‍♂️ Gym Workout Logger "
    "<span style='font-size:0.75em;color:#22d3ee;'>· Train · Track · Dominate</span>"
    "</h1>",
    unsafe_allow_html=True,
)

# ------------------------- Logging Form ------------------------- #

st.markdown("### 💪 Log Your Workout")

with st.container():
    form_cols = st.columns([2, 1, 1, 1, 1])
    with form_cols[0]:
        exercise_choice = st.selectbox(
            "Exercise",
            options=["Custom…"] + DEFAULT_EXERCISES,
            index=1,
        )
        if exercise_choice == "Custom…":
            exercise_custom = st.text_input("Custom Exercise Name")
            exercise = exercise_custom.strip() if exercise_custom.strip() else "Custom Exercise"
        else:
            exercise = exercise_choice

    with form_cols[1]:
        sets = st.number_input("Sets", min_value=1, max_value=20, value=3, step=1)
    with form_cols[2]:
        reps = st.number_input("Reps", min_value=1, max_value=50, value=8, step=1)
    with form_cols[3]:
        weight = st.number_input("Weight (kg)", min_value=0.0, max_value=500.0, value=60.0, step=2.5)
    with form_cols[4]:
        log_date = st.date_input("Date", value=date.today())

    add_col, _ = st.columns([0.3, 1])
    with add_col:
        if st.button("➕ Add Workout"):
            if not exercise.strip():
                st.error("Please enter a valid exercise name.")
            elif sets <= 0 or reps <= 0 or weight < 0:
                st.error("Sets and reps must be positive. Weight must be non-negative.")
            else:
                volume = sets * reps * weight
                entry = {
                    "Date": pd.to_datetime(log_date),
                    "Exercise": exercise,
                    "Sets": int(sets),
                    "Reps": int(reps),
                    "Weight (kg)": float(weight),
                    "Volume": float(volume),
                }
                add_workout_entry(entry)
                st.success(
                    f"Logged: {log_date} · {exercise} — {sets}×{reps} @ {weight} kg "
                    f"(Volume: {volume:.0f})"
                )

st.markdown("---")

# ------------------------- Filter Controls ------------------------- #

st.markdown("### 📋 Workout Log & Filters")

df = st.session_state.workouts_df.copy()

if not df.empty:
    if not pd.api.types.is_datetime64_any_dtype(df["Date"]):
        df["Date"] = pd.to_datetime(df["Date"])

    exercises_in_data = sorted(df["Exercise"].unique().tolist())
    exercise_filter = st.multiselect(
        "Filter by exercise",
        options=exercises_in_data,
        default=exercises_in_data,
    )

    min_date = df["Date"].min().date()
    max_date = df["Date"].max().date()

    date_cols = st.columns(2)
    with date_cols[0]:
        start_date = st.date_input("From date", value=min_date, min_value=min_date, max_value=max_date)
    with date_cols[1]:
        end_date = st.date_input("To date", value=max_date, min_value=min_date, max_value=max_date)

    mask = (df["Exercise"].isin(exercise_filter)) & (
        (df["Date"].dt.date >= start_date) & (df["Date"].dt.date <= end_date)
    )
    filtered_df = df.loc[mask].sort_values("Date")

    total_volume_filtered = filtered_df["Volume"].sum() if not filtered_df.empty else 0
    st.markdown(
        f"**Total Volume (filtered):** `{total_volume_filtered:.0f}` kg·reps"
    )

    st.markdown("#### Logged Workouts")
    display_df = filtered_df.copy()
    display_df["Date"] = display_df["Date"].dt.date
    st.dataframe(display_df, use_container_width=True)
else:
    st.info("No workouts logged yet. Add your first session above or load demo data from the sidebar.")
    filtered_df = df

st.markdown("---")

# ------------------------- Weekly Stats & Progress Chart ------------------------- #

st.markdown("### 📈 Weekly Progress & Stats")

if not df.empty:
    today = date.today()
    week_start = today - timedelta(days=6)
    week_mask = df["Date"].dt.date >= week_start
    week_df = df.loc[week_mask].copy()

    if not week_df.empty:
        heavy = week_df.groupby("Exercise")["Weight (kg)"].max().sort_values(ascending=False)
        total_sets_week = week_df["Sets"].sum()
        total_reps_week = week_df["Reps"].sum()
        total_volume_week = week_df["Volume"].sum()
    else:
        heavy = pd.Series(dtype=float)
        total_sets_week = total_reps_week = total_volume_week = 0

    stat_cols = st.columns(4)
    with stat_cols[0]:
        st.markdown(
            f"<div class='metric-card'>"
            f"<div class='metric-label'>Total Volume (Last 7 Days)</div>"
            f"<div class='metric-value'>{total_volume_week:.0f}</div>"
            f"</div>",
            unsafe_allow_html=True,
        )
    with stat_cols[1]:
        st.markdown(
            f"<div class='metric-card'>"
            f"<div class='metric-label'>Total Sets (Last 7 Days)</div>"
            f"<div class='metric-value'>{int(total_sets_week)}</div>"
            f"</div>",
            unsafe_allow_html=True,
        )
    with stat_cols[2]:
        st.markdown(
            f"<div class='metric-card'>"
            f"<div class='metric-label'>Total Reps (Last 7 Days)</div>"
            f"<div class='metric-value'>{int(total_reps_week)}</div>"
            f"</div>",
            unsafe_allow_html=True,
        )
    with stat_cols[3]:
        if not heavy.empty:
            top_ex = heavy.index[0]
            top_wt = heavy.iloc[0]
            label = f"{top_ex}: {top_wt:.1f} kg"
        else:
            label = "N/A"
        st.markdown(
            f"<div class='metric-card'>"
            f"<div class='metric-label'>Heaviest Lift (Last 7 Days)</div>"
            f"<div class='metric-value'>{label}</div>"
            f"</div>",
            unsafe_allow_html=True,
        )

    st.markdown("#### Weekly Volume Trend")

    if not filtered_df.empty:
        chart_df = filtered_df.copy()
    else:
        chart_df = df.copy()

    if not chart_df.empty:
        chart_df["Day"] = chart_df["Date"].dt.date

        group_by_exercise = st.checkbox(
            "Show per-exercise trend (stacked by Exercise)",
            value=True,
        )

        if group_by_exercise:
            agg = (
                chart_df.groupby(["Day", "Exercise"])["Volume"]
                .sum()
                .reset_index()
            )
            chart = (
                alt.Chart(agg)
                .mark_bar()
                .encode(
                    x=alt.X("Day:T", title="Day"),
                    y=alt.Y("Volume:Q", title="Volume (kg·reps)"),
                    color=alt.Color("Exercise:N", legend=alt.Legend(title="Exercise")),
                    tooltip=["Day:T", "Exercise:N", "Volume:Q"],
                )
                .properties(height=350)
            )
        else:
            agg = chart_df.groupby("Day")["Volume"].sum().reset_index()
            chart = (
                alt.Chart(agg)
                .mark_line(point=True)
                .encode(
                    x=alt.X("Day:T", title="Day"),
                    y=alt.Y("Volume:Q", title="Total Volume (kg·reps)"),
                    tooltip=["Day:T", "Volume:Q"],
                )
                .properties(height=350)
            )

        st.altair_chart(chart, use_container_width=True)
    else:
        st.info("Not enough data to draw a weekly trend. Try logging more workouts.")
else:
    st.info("Weekly stats will appear here once you log some workouts.")

