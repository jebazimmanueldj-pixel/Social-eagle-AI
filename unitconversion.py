"""
Universal Converter - Streamlit App (app.py)

Usage:
    pip install streamlit requests
    streamlit run app.py

Features:
    - Money (currency) conversion using LIVE exchange rates (exchangerate.host)
      with 1-hour caching and a safe offline fallback.
    - Weight conversion (kg, g, lb, oz) with clear formulas and swap button.
    - Measurement conversion:
        * Length: m, cm, mm, km, in, ft, yd, mile
        * Volume: L, mL, fl oz, gallon
      with formulas and swap button.
    - Temperature conversion: Celsius, Fahrenheit, Kelvin.

    All modes:
    - Non-negative validation where appropriate.
    - Quick preset/example buttons.
    - Simple, accessible UI with helpful labels.
"""

from __future__ import annotations

from datetime import datetime
from typing import Dict, Tuple

import requests
import streamlit as st

# -----------------------------------------------------------------------------
# Page configuration
# -----------------------------------------------------------------------------
st.set_page_config(page_title="Universal Converter", layout="centered")

st.title("🔄 Universal Converter")

st.markdown(
    """
Welcome to **Universal Converter** — one page for multiple conversions:

- 💰 Money (Currency) with **live rates** and offline fallback  
- ⚖️ Weight (kg, g, lb, oz)  
- 📏 Measurement (length & volume)  
- 🌡️ Temperature (°C, °F, K)  

Use the **sidebar** to choose a mode, then enter your value and units.  
Example buttons are there to quickly fill common scenarios.
"""
)

st.markdown("---")

# -----------------------------------------------------------------------------
# LIVE CURRENCY RATES (with caching and fallback)
# -----------------------------------------------------------------------------

@st.cache_data(ttl=3600)
def get_rates() -> Tuple[Dict[str, float], str, str]:
    """
    Get exchange rates from exchangerate.host.
    Cached for 1 hour to reduce API calls.

    Returns:
        rates: dict of currency_code -> rate (relative to a base currency)
        source: description of where rates came from
        timestamp: string representing last update time (UTC/date)
    """
    url = "https://api.exchangerate.host/latest"
    try:
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        data = resp.json()

        rates = data.get("rates", {})
        base = data.get("base", "EUR")
        if base not in rates:
            rates[base] = 1.0

        source = "Live rates from exchangerate.host"
        timestamp = data.get("date", datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"))
        return rates, source, timestamp
    except Exception:
        # Fallback simple demo rates relative to USD
        fallback = {
            "USD": 1.00,
            "EUR": 0.92,
            "INR": 82.0,
            "GBP": 0.80,
            "JPY": 150.0,
        }
        source = "Fallback demo rates (offline, relative to USD)"
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
        return fallback, source, timestamp


def convert_currency(amount: float, from_ccy: str, to_ccy: str) -> Tuple[float | None, str, str]:
    """
    Convert an amount from one currency to another using the rates dict.

    Args:
        amount: numeric amount to convert
        from_ccy: source currency code
        to_ccy: target currency code

    Returns:
        value: converted amount (None if impossible)
        source: rate source description
        timestamp: last update / fetch time
    """
    rates, source, ts = get_rates()
    if from_ccy not in rates or to_ccy not in rates:
        return None, source, ts

    try:
        value = amount * (rates[to_ccy] / rates[from_ccy])
    except ZeroDivisionError:
        value = None

    return value, source, ts


# -----------------------------------------------------------------------------
# Conversion tables for weight, length, and volume
# -----------------------------------------------------------------------------

# Weight units in terms of kilograms
WEIGHT_TO_KG = {
    "g (gram)": 0.001,
    "kg (kilogram)": 1.0,
    "lb (pound)": 0.45359237,
    "oz (ounce)": 0.028349523125,
}

# Length units in terms of meters
LENGTH_TO_M = {
    "mm (millimeter)": 0.001,
    "cm (centimeter)": 0.01,
    "m (meter)": 1.0,
    "km (kilometer)": 1000.0,
    "in (inch)": 0.0254,
    "ft (foot)": 0.3048,
    "yd (yard)": 0.9144,
    "mile": 1609.344,
}

# Volume units in terms of liters
VOLUME_TO_L = {
    "mL (milliliter)": 0.001,
    "L (liter)": 1.0,
    "fl oz (fluid ounce)": 0.0295735,
    "gallon": 3.78541,
}

TEMP_UNITS = ["°C", "°F", "K"]


def unit_factor(from_factor: float, to_factor: float) -> float:
    """Return scalar conversion factor from one base-factor to another."""
    return from_factor / to_factor


def label_symbol(label: str) -> str:
    """
    Extract the symbol part of a unit label, e.g.:
    'kg (kilogram)' -> 'kg'
    """
    if "(" in label:
        return label.split("(")[0].strip()
    return label.strip()


def convert_temperature(value: float, from_u: str, to_u: str) -> Tuple[float, str]:
    """
    Convert between °C, °F, and K. Negative values are allowed.

    Returns:
        result_value, formula_string
    """
    if from_u == to_u:
        return value, f"{value} {from_u} (no change, same units)"

    # Convert from from_u to Celsius
    if from_u == "°C":
        c = value
    elif from_u == "°F":
        c = (value - 32.0) * 5.0 / 9.0
    elif from_u == "K":
        c = value - 273.15
    else:
        c = value

    # Convert Celsius to target
    if to_u == "°C":
        result = c
        formula = f"{value} {from_u} → {result:.4g} °C"
    elif to_u == "°F":
        f = c * 9.0 / 5.0 + 32.0
        result = f
        formula = f"{value} {from_u} → {c:.4g} °C × 9/5 + 32 = {result:.4g} °F"
    elif to_u == "K":
        k = c + 273.15
        result = k
        formula = f"{value} {from_u} → {c:.4g} °C + 273.15 = {result:.4g} K"
    else:
        result = value
        formula = f"{value} {from_u} (unknown target unit)"

    return result, formula


# -----------------------------------------------------------------------------
# Sidebar: Mode selection
# -----------------------------------------------------------------------------

st.sidebar.header("Mode")

mode = st.sidebar.radio(
    "Select converter type:",
    ("Money (Currency)", "Weight", "Measurement", "Temperature"),
)

st.sidebar.markdown("Use the example buttons in each mode to quickly fill values.")

# -----------------------------------------------------------------------------
# MONEY MODE (live conversion)
# -----------------------------------------------------------------------------

if mode == "Money (Currency)":
    st.subheader("💰 Money (Currency) Converter")

    st.info("Defaults to **100 USD → EUR** using live rates when available.")

    # Example presets
    col_p1, col_p2 = st.columns(2)
    with col_p1:
        if st.button("Example: 100 USD → EUR"):
            st.session_state["money_amt"] = 100.0
            st.session_state["money_from"] = "USD"
            st.session_state["money_to"] = "EUR"
    with col_p2:
        if st.button("Example: 100 EUR → INR"):
            st.session_state["money_amt"] = 100.0
            st.session_state["money_from"] = "EUR"
            st.session_state["money_to"] = "INR"

    currency_options = ["USD", "EUR", "INR", "GBP", "JPY"]

    c1, c2, c3 = st.columns(3)
    with c1:
        amount = st.number_input(
            "Amount",
            min_value=0.0,
            value=st.session_state.get("money_amt", 100.0),
            step=1.0,
            key="money_amt",
        )
    with c2:
        from_ccy = st.selectbox(
            "From",
            currency_options,
            index=currency_options.index(st.session_state.get("money_from", "USD")),
            key="money_from",
        )
    with c3:
        to_ccy = st.selectbox(
            "To",
            currency_options,
            index=currency_options.index(st.session_state.get("money_to", "EUR")),
            key="money_to",
        )

    swap_col, _ = st.columns([0.35, 1])
    with swap_col:
        if st.button("⇄ Swap currencies"):
            f = st.session_state["money_from"]
            t = st.session_state["money_to"]
            st.session_state["money_from"], st.session_state["money_to"] = t, f
            from_ccy, to_ccy = t, f

    if amount < 0:
        st.error("Amount must be non-negative.")
    else:
        converted, source, ts = convert_currency(amount, from_ccy, to_ccy)
        if converted is None:
            st.error("Conversion failed, please try again or choose different currencies.")
        else:
            st.success(f"{amount:.2f} {from_ccy} = **{converted:.2f} {to_ccy}**")

        st.caption(f"Rates source: {source}")
        st.caption(f"Last updated: {ts}")

# -----------------------------------------------------------------------------
# WEIGHT MODE
# -----------------------------------------------------------------------------

elif mode == "Weight":
    st.subheader("⚖️ Weight Converter")

    st.info("Convert between kg, g, lb, and oz. Negative values are not allowed.")

    # Example preset: 5 kg -> lb
    preset_col, _ = st.columns(2)
    with preset_col:
        if st.button("Example: 5 kg → lb"):
            st.session_state["w_val"] = 5.0
            st.session_state["w_from"] = "kg (kilogram)"
            st.session_state["w_to"] = "lb (pound)"

    units = list(WEIGHT_TO_KG.keys())

    c1, c2, c3 = st.columns(3)
    with c1:
        w_val = st.number_input(
            "Value",
            min_value=0.0,
            value=st.session_state.get("w_val", 1.0),
            step=0.1,
            key="w_val",
        )
    with c2:
        w_from = st.selectbox(
            "From unit",
            units,
            index=units.index(st.session_state.get("w_from", "kg (kilogram)")),
            key="w_from",
        )
    with c3:
        w_to = st.selectbox(
            "To unit",
            units,
            index=units.index(st.session_state.get("w_to", "lb (pound)")),
            key="w_to",
        )

    swap_col, _ = st.columns([0.35, 1])
    with swap_col:
        if st.button("⇄ Swap units", key="w_swap"):
            tmp_from = st.session_state["w_from"]
            st.session_state["w_from"] = st.session_state["w_to"]
            st.session_state["w_to"] = tmp_from
            w_from, w_to = st.session_state["w_from"], st.session_state["w_to"]

    if w_val < 0:
        st.error("Value must be non-negative.")
    else:
        from_factor = WEIGHT_TO_KG[w_from]
        to_factor = WEIGHT_TO_KG[w_to]

        if w_from == w_to:
            w_result = w_val
            factor = 1.0
        else:
            factor = unit_factor(from_factor, to_factor)
            w_result = w_val * factor

        from_sym = label_symbol(w_from)
        to_sym = label_symbol(w_to)

        st.success(f"{w_val:g} {from_sym} = **{w_result:.6g} {to_sym}**")
        st.caption(
            f"Formula: {w_val:g} {from_sym} × ({from_factor:g} kg / {to_factor:g} kg) = {w_result:.6g} {to_sym}"
        )

# -----------------------------------------------------------------------------
# MEASUREMENT MODE (Length & Volume)
# -----------------------------------------------------------------------------

elif mode == "Measurement":
    st.subheader("📏 Measurement Converter")

    st.info(
        "Convert **length** (m, cm, mm, km, in, ft, yd, mile) or **volume** "
        "(L, mL, fl oz, gallon). Negative values are not allowed."
    )

    category = st.radio(
        "Category",
        ("Length", "Volume"),
        horizontal=True,
        key="meas_cat",
    )

    # Example presets
    col_len, col_vol = st.columns(2)
    with col_len:
        if st.button("Example: 2 miles → km"):
            st.session_state["m_val"] = 2.0
            st.session_state["m_from"] = "mile"
            st.session_state["m_to"] = "km (kilometer)"
            st.session_state["meas_cat"] = "Length"
    with col_vol:
        if st.button("Example: 1 gallon → L"):
            st.session_state["m_val"] = 1.0
            st.session_state["m_from"] = "gallon"
            st.session_state["m_to"] = "L (liter)"
            st.session_state["meas_cat"] = "Volume"

    if category == "Length":
        units_map = LENGTH_TO_M
        base_label = "meter"
    else:
        units_map = VOLUME_TO_L
        base_label = "liter"

    units = list(units_map.keys())

    c1, c2, c3 = st.columns(3)
    with c1:
        m_val = st.number_input(
            "Value",
            min_value=0.0,
            value=st.session_state.get("m_val", 1.0),
            step=0.1,
            key="m_val",
        )
    with c2:
        default_from = st.session_state.get("m_from", units[0])
        if default_from not in units:
            default_from = units[0]
        m_from = st.selectbox(
            "From unit",
            units,
            index=units.index(default_from),
            key="m_from",
        )
    with c3:
        default_to = st.session_state.get("m_to", units[1] if len(units) > 1 else units[0])
        if default_to not in units:
            default_to = units[1] if len(units) > 1 else units[0]
        m_to = st.selectbox(
            "To unit",
            units,
            index=units.index(default_to),
            key="m_to",
        )

    swap_col, _ = st.columns([0.35, 1])
    with swap_col:
        if st.button("⇄ Swap units", key="m_swap"):
            tmp_from = st.session_state["m_from"]
            st.session_state["m_from"] = st.session_state["m_to"]
            st.session_state["m_to"] = tmp_from
            m_from, m_to = st.session_state["m_from"], st.session_state["m_to"]

    if m_val < 0:
        st.error("Value must be non-negative.")
    else:
        f_factor = units_map[m_from]
        t_factor = units_map[m_to]

        if m_from == m_to:
            m_result = m_val
            factor = 1.0
        else:
            factor = unit_factor(f_factor, t_factor)
            m_result = m_val * factor

        from_sym = label_symbol(m_from)
        to_sym = label_symbol(m_to)

        st.success(f"{m_val:g} {from_sym} = **{m_result:.6g} {to_sym}**")
        st.caption(
            f"Formula: {m_val:g} {from_sym} × ({f_factor:g} {base_label}s / "
            f"{t_factor:g} {base_label}s) = {m_result:.6g} {to_sym}"
        )

# -----------------------------------------------------------------------------
# TEMPERATURE MODE
# -----------------------------------------------------------------------------

elif mode == "Temperature":
    st.subheader("🌡️ Temperature Converter")

    st.info(
        "Convert between Celsius (°C), Fahrenheit (°F), and Kelvin (K). "
        "Negative temperatures are allowed."
    )

    # Example presets
    p1, p2 = st.columns(2)
    with p1:
        if st.button("Example: 37 °C → °F"):
            st.session_state["t_val"] = 37.0
            st.session_state["t_from"] = "°C"
            st.session_state["t_to"] = "°F"
    with p2:
        if st.button("Example: 100 °F → °C"):
            st.session_state["t_val"] = 100.0
            st.session_state["t_from"] = "°F"
            st.session_state["t_to"] = "°C"

    c1, c2, c3 = st.columns(3)
    with c1:
        t_val = st.number_input(
            "Temperature",
            value=st.session_state.get("t_val", 25.0),
            step=0.5,
            key="t_val",
        )
    with c2:
        t_from = st.selectbox(
            "From",
            TEMP_UNITS,
            index=TEMP_UNITS.index(st.session_state.get("t_from", "°C")),
            key="t_from",
        )
    with c3:
        t_to = st.selectbox(
            "To",
            TEMP_UNITS,
            index=TEMP_UNITS.index(st.session_state.get("t_to", "°F")),
            key="t_to",
        )

    swap_col, _ = st.columns([0.35, 1])
    with swap_col:
        if st.button("⇄ Swap units", key="t_swap"):
            tmp_from = st.session_state["t_from"]
            st.session_state["t_from"] = st.session_state["t_to"]
            st.session_state["t_to"] = tmp_from
            t_from, t_to = st.session_state["t_from"], st.session_state["t_to"]

    t_result, t_formula = convert_temperature(t_val, t_from, t_to)
    st.success(f"{t_val:g} {t_from} = **{t_result:.4g} {t_to}**")
    st.caption(f"Formula: {t_formula}")

# -----------------------------------------------------------------------------
# Footer
# -----------------------------------------------------------------------------

st.markdown("---")
st.caption(
    "Universal Converter · Currency mode uses live rates when online "
    "(with 1-hour caching) and falls back to a small built-in table if offline."
)
