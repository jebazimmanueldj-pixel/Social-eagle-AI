import streamlit as st
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path

# ----------------------------
# Page config
# ----------------------------
st.set_page_config(
    page_title="💧 Water Intake Tracker",
    page_icon="💧",
    layout="centered"
)

# ----------------------------
# Custom CSS for premium UI
# ----------------------------
st.markdown(
    """
    <style>
    /* Overall background */
    .stApp {
        background: radial-gradient(circle at top left, #c4f0ff, #f5fbff 40%, #ffffff 70%);
        font-family: "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* Glassmorphism cards */
    .glass-card {
        background: rgba(255, 255, 255, 0.75);
        border-radius: 18px;
        padding: 1.2rem 1.5rem;
        box-shadow: 0 18px 45px rgba(15, 116, 149, 0.18);
        border: 1px solid rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
    }

    .glass-card-compact {
        background: rgba(255,255,255,0.85);
        border-radius: 14px;
        padding: 0.8rem 1rem;
        box-shadow: 0 10px 30px rgba(15, 116, 149, 0.15);
        border: 1px solid rgba(255,255,255,0.8);
        backdrop-filter: blur(10px);
    }

    .water-header {
        font-size: 1.8rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 0.7rem;
    }

    .water-subtitle {
        font-size: 0.95rem;
        opacity: 0.8;
    }

    .pill {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        font-size: 0.78rem;
        background: rgba(0, 133, 255, 0.08);
        border: 1px solid rgba(0, 133, 255, 0.22);
    }

    .pill span {
        font-weight: 600;
    }

    .water-progress-label {
        display: flex;
        justify-content: space-between;
        font-size: 0.82rem;
        margin-bottom: 0.25rem;
        opacity: 0.85;
    }

    .water-big-number {
        font-size: 1.6rem;
        font-weight: 700;
    }

    .water-unit {
        font-size: 0.9rem;
        opacity: 0.7;
        margin-left: 0.2rem;
    }

    .footer-note {
        font-size: 0.75rem;
        opacity: 0.6;
        margin-top: 0.8rem;
    }

    /* Compact mobile tweak */
    @media (max-width: 768px) {
        .water-header { font-size: 1.45rem; }
    }
    </style>
    """,
    unsafe_allow_html=True
)

# ----------------------------
# Constants
# ----------------------------
GOAL_ML = 3000  # 3L daily goal
DATA_FILE = Path("water_log.csv")

# ----------------------------
# State & Data helpers
# ----------------------------
def init_state():
    if "water_data" not in st.session_state:
        if DATA_FILE.exists():
            try:
                df = pd.read_csv(DATA_FILE, parse_dates=["date"])
                st.session_state.water_data = df
            except Exception:
                st.session_state.water_data = pd.DataFrame(columns=["date", "amount_ml"])
        else:
            st.session_state.water_data = pd.DataFrame(columns=["date", "amount_ml"])

def save_data():
    """Persist session data to CSV."""
    st.session_state.water_data.to_csv(DATA_FILE, index=False)

def add_intake(amount_ml: int):
    """Add intake for today and persist."""
    today = datetime.now().date()
    new_row = {"date": pd.to_datetime(today), "amount_ml": amount_ml}
    st.session_state.water_data = pd.concat(
        [st.session_state.water_data, pd.DataFrame([new_row])],
        ignore_index=True
    )
    save_data()

def reset_today():
    today = datetime.now().date()
    df = st.session_state.water_data
    st.session_state.water_data = df[df["date"].dt.date != today]
    save_data()

def clear_all():
    st.session_state.water_data = pd.DataFrame(columns=["date", "amount_ml"])
    if DATA_FILE.exists():
        DATA_FILE.unlink()

def get_today_total():
    if st.session_state.water_data.empty:
        return 0
    today = datetime.now().date()
    today_rows = st.session_state.water_data[
        st.session_state.water_data["date"].dt.date == today
    ]
    return int(today_rows["amount_ml"].sum())

def get_weekly_data():
    """Return last 7 days (including today) aggregated."""
    if st.session_state.water_data.empty:
        today = datetime.now().date()
        days = [today - timedelta(days=i) for i in range(6, -1, -1)]
        return pd.DataFrame({"date": days, "total_ml": [0] * 7})

    today = datetime.now().date()
    start = today - timedelta(days=6)
    df = st.session_state.water_data.copy()
    df["date_only"] = df["date"].dt.date
    df = df[(df["date_only"] >= start) & (df["date_only"] <= today)]

    grouped = df.groupby("date_only")["amount_ml"].sum().reset_index()
    grouped.rename(columns={"date_only": "date", "amount_ml": "total_ml"}, inplace=True)

    all_days = [start + timedelta(days=i) for i in range(7)]
    merged = pd.DataFrame({"date": all_days}).merge(grouped, on="date", how="left")
    merged["total_ml"] = merged["total_ml"].fillna(0).astype(int)
    return merged

# ----------------------------
# Init state
# ----------------------------
init_state()

# ----------------------------
# Sidebar - guide & actions
# ----------------------------
with st.sidebar:
    st.markdown("### 💧 How to use")
    st.write(
        "- Enter water amount in **ml** and click **Add Intake**.\n"
        "- Track your progress towards a **3L daily goal**.\n"
        "- View your **weekly hydration chart**.\n"
        "- Use **Reset Today** if you logged wrong values.\n"
        "- Use **Clear All Data** to start fresh."
    )

    st.divider()

    st.markdown("#### ⚙️ Quick actions")
    col_sb1, col_sb2 = st.columns(2)
    with col_sb1:
        if st.button("↻ Reset Today", use_container_width=True):
            reset_today()
            st.success("Today's water log has been reset.")
    with col_sb2:
        if st.button("🗑 Clear All", use_container_width=True):
            clear_all()
            st.warning("All water logs cleared.")

    st.divider()
    st.caption("Built with ❤️ using Streamlit · Stay hydrated!")

# ----------------------------
# Header
# ----------------------------
st.markdown(
    """
    <div class="glass-card">
        <div class="water-header">
            <span>💧 Water Intake Tracker</span>
            <div class="pill">
                <span>Goal</span>
                <span>3L / day</span>
            </div>
        </div>
        <div class="water-subtitle">
            Log your sips, watch your bottle fill up, and keep your body happy.
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

st.write("")  # spacing

# ----------------------------
# Intake input & today stats
# ----------------------------
col_input, col_stats = st.columns([1.1, 1])

with col_input:
    st.markdown('<div class="glass-card">', unsafe_allow_html=True)
    st.subheader("Add your intake")
    intake_ml = st.number_input(
        "Amount (ml)",
        min_value=50,
        max_value=2000,
        value=250,
        step=50,
        help="Enter how much water you just drank in milliliters.",
        label_visibility="visible",
        key="intake_ml_input",
    )

    add_btn = st.button("➕ Add Intake", use_container_width=True)
    if add_btn:
        add_intake(int(intake_ml))
        st.success(f"Logged {intake_ml} ml. Keep going! ✨")
    st.markdown("</div>", unsafe_allow_html=True)

with col_stats:
    today_total = get_today_total()
    progress_ratio = min(today_total / GOAL_ML, 1.0) if GOAL_ML > 0 else 0.0
    progress_percent = int(progress_ratio * 100)

    st.markdown('<div class="glass-card">', unsafe_allow_html=True)
    st.subheader("Today’s progress")

    # Progress bar label
    st.markdown(
        f"""
        <div class="water-progress-label">
            <span>{today_total} ml drunk today</span>
            <span>{progress_percent}% of 3L goal</span>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.progress(progress_ratio)

    col_a, col_b = st.columns(2)
    with col_a:
        st.markdown(
            f"""
            <div style="margin-top:0.4rem;">
                <span class="water-big-number">{today_total}</span>
                <span class="water-unit">ml</span>
                <div style="font-size:0.8rem; opacity:0.75;">Consumed today</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with col_b:
        remaining = max(GOAL_ML - today_total, 0)
        st.markdown(
            f"""
            <div style="margin-top:0.4rem; text-align:right;">
                <span class="water-big-number">{remaining}</span>
                <span class="water-unit">ml</span>
                <div style="font-size:0.8rem; opacity:0.75;">To reach goal</div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    # Status text
    if today_total >= GOAL_ML:
        st.success("🔥 Fantastic! You've hit your 3L goal today!")
    elif today_total >= GOAL_ML * 0.6:
        st.info("Almost there! A few more sips to reach 3L. 💪")
    else:
        st.write("You’re off to a good start. Keep sipping through the day. 👍")
    st.markdown("</div>", unsafe_allow_html=True)

st.write("")  # spacing

# ----------------------------
# Weekly chart
# ----------------------------
st.markdown('<div class="glass-card">', unsafe_allow_html=True)
st.subheader("📊 Weekly hydration overview")

weekly_df = get_weekly_data()
weekly_df["date_str"] = weekly_df["date"].apply(lambda d: d.strftime("%a"))

if weekly_df["total_ml"].sum() == 0:
    st.write("No data yet for this week. Start logging to see your hydration trend! 🚀")
else:
    # Use Altair for a clean chart
    import altair as alt

    chart = (
        alt.Chart(weekly_df)
        .mark_bar(cornerRadiusTopLeft=6, cornerRadiusTopRight=6)
        .encode(
            x=alt.X("date_str", title="Day"),
            y=alt.Y("total_ml", title="Total (ml)", scale=alt.Scale(domain=[0, max(weekly_df["total_ml"].max(), GOAL_ML)])),
            tooltip=[
                alt.Tooltip("date:T", title="Date"),
                alt.Tooltip("total_ml:Q", title="Total (ml)"),
            ],
        )
        .properties(height=260)
    )

    goal_line = alt.Chart(weekly_df).mark_rule(strokeDash=[4, 4]).encode(
        y=alt.datum(GOAL_ML)
    )

    st.altair_chart(chart + goal_line, use_container_width=True)

st.markdown(
    """
    <div class="footer-note">
        Tip: Try to spread your water intake evenly across the day instead of drinking a lot at once. 🕒
    </div>
    """,
    unsafe_allow_html=True,
)
st.markdown("</div>", unsafe_allow_html=True)

# ----------------------------
# Raw data (optional)
# ----------------------------
with st.expander("📋 View raw log data"):
    if st.session_state.water_data.empty:
        st.write("No data logged yet.")
    else:
        df_display = st.session_state.water_data.copy()
        df_display["date"] = df_display["date"].dt.strftime("%Y-%m-%d")
        st.dataframe(df_display, hide_index=True)
