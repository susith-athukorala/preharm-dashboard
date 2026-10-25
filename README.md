# PreHaRM Dashboard: Prototype & Testing

A clickable prototype of the PreHaRM dashboard for Nurse Unit Managers (NUMs). It shows the predicted risk of three inpatient harms (falls, medication errors and patient aggression) for each shift. It also shows what sits behind that risk, so a NUM can see where a rostering change might help.

**Live prototype:** `https://susith.lk/preharm-dashboard/`

> **Prototype only.** All figures, names and wards are made-up sample data. Nothing here comes from real patients, staff or hospital systems, and the sign-in screen checks nothing.

---

## Why this exists

NUMs build and adjust rosters, and a roster decision made today shapes the risk on the ward tonight and later in the week. The PreHaRM model predicts that risk. This dashboard is about presenting the prediction so it is useful at the moment a rostering decision is made.

Three principles guide the design:

| Principle | What it means here |
|---|---|
| **Apparent** | The important information is visible at a glance, with no digging. |
| **Accessible** | Few clicks to reach the information, and making changes is easy. |
| **Timely** | Information reflects the current situation, with the update time shown. |

The design is being developed with NUMs and will change as their feedback comes in.

## What you can try

**1. Sign in (demo)**
A single staff sign-in button, then a choice of ward. In a real deployment this would use the hospital's existing staff single sign-on, not a separate PreHaRM password.

**2. Today by shift**
- Risk of falls, medication errors and aggression shown separately for the Early, Late and Night shifts, each coloured as low, medium or high.
- Staff on each shift shown as counts (RN, EN, AIN/PCA, agency).
- A breakdown of how much of the risk comes from staffing (skill mix, inexperience, agency use, short numbers) and how much from patient factors.
- A "needs attention" strip listing any risk in the high band.

**3. Week ahead**
- A grid of the next 7 days (starting today) by shift, coloured by risk, so problem shifts stand out across the coming week.
- A forecast chart for any selected shift, running from today to the same weekday next week. The shaded range widens for days further from today, because patient and staff details are more likely to change.

**Coming later:** a separate view for testing roster changes and seeing their effect on predicted risk.

## Risk bands

| Band | Cut-off (placeholder) |
|---|---|
| Low | under 15% |
| Medium | 15–29% |
| High | 30% and above |

These cut-offs are placeholders. Where the lines fall is a clinical decision that will be agreed with NUMs.

## Run it on your own computer

There is nothing to install. Download or clone the repository and open `index.html` in a web browser.

## Change the sample data

Everything you might want to adjust is in **`js/data.js`**:

- ward names and the demo user's name
- how many minutes before opening the page the "last updated" time shows (`updatedMinsAgo`)
- band cut-offs (`lowMax`, `highMin`)
- risk values for each harm, shift and day
- staff counts and risk contributions for each shift

Dates are worked out from the current date each time the page opens, so the prototype always looks current. Sample risk values are set per weekday, so weekends keep their higher figures whatever day you open it.

Save the file and refresh the browser to see the changes.

## Files

```
index.html      demo sign-in and ward choice
today.html      today by shift
week.html       week ahead
css/styles.css  layout and colours
js/data.js      sample data and settings
js/today.js     draws the today view
js/week.js      draws the week view
```

Plain HTML, CSS and JavaScript. No frameworks, no build step, no data sent anywhere.

## Status

Early-stage design prototype, for discussion within the project team. It is not a clinical tool and must not be used to make care or staffing decisions.

## Author

Susith Chandima Athukorala
Rosemary Bryant AO Research Centre, Adelaide University

© 2026. All rights reserved.
