<script lang="ts">
    type Props = {date: string};

    let {date = $bindable()}: Props = $props();

    const split = date.split('/');
    let day = $state<string>(split[0]);
    let month = $state<string>(split[1]);
    let year = $state<string>(split[2]);

    function clamp(value: number, min: number, max: number) {
        if (isNaN(value) || value < min) {
            return min;
        }
        if (value > max) {
            return max;
        }
        return value;
    }

    function clampDay(value: string) {
        if (month === '1' || month === '3' || month === '5' || month === '7' || month === '8' || month === '10' || month === '12') {
            return clamp(parseInt(value), 1, 31).toString().padStart(2, '0');
        } else if (month === '2') {
            return clamp(parseInt(value), 1, 29).toString().padStart(2, '0');
        } else {
            return clamp(parseInt(value), 1, 30).toString().padStart(2, '0');
        }
    }
    function clampMonth(value: string) {
        return clamp(parseInt(value), 1, 12).toString().padStart(2, '0');
    }

    function clampYear(value: string) {
        return clamp(parseInt(value), 1, 9999).toString();
    }

    function onKeyDown(event: KeyboardEvent & {currentTarget: HTMLInputElement}, type: 'day' | 'month' | 'year') {
        if (event.key === 'ArrowUp') {
            if (type === 'day') {
                day = clampDay((parseInt(day) + 1).toString());
            } else if (type === 'month') {
                month = clampMonth((parseInt(month) + 1).toString());
            } else {
                year = clampYear((parseInt(year) + 1).toString());
            }
            event.preventDefault();
            return;
        } else if (event.key === 'ArrowDown') {
            if (type === 'day') {
                day = clampDay((parseInt(day) - 1).toString());
            } else if (type === 'month') {
                month = clampMonth((parseInt(month) - 1).toString());
            } else {
                year = clampYear((parseInt(year) - 1).toString());
            }
            event.preventDefault();
            return;
        }
        // Allow: backspace, delete, tab, escape, enter, and numbers 0-9
        const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
        const allowedNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        if ((event.ctrlKey === true || event.metaKey === true) && ['a', 'c', 'v', 'x'].indexOf(event.key.toLowerCase()) !== -1) {
            return;
        }
        const isNumber = allowedNumbers.includes(event.key);
        // Prevent default for any key not in the allowed list
        if (!allowedKeys.includes(event.key) && !isNumber) {
            event.preventDefault();
            return;
        }

        // Prevent adding the number would overflow the date
        if (isNumber) {
            if (type === 'day' && day === clampDay(day + event.key)) {
                event.preventDefault();
            } else if (type === 'month' && month === clampMonth(month + event.key)) {
                event.preventDefault();
            } else if (type === 'year' && year === clampYear(year + event.key)) {
                event.preventDefault();
            }
        }
    }

    $effect(() => {
        date = `${day ?? 1}/${month ?? 1}/${year ?? 1}`;
    });
</script>

<div>
    <input class="day" type="text" value={day} onkeydown={event => onKeyDown(event, 'day')} oninput={e => (day = clampDay(e.currentTarget.value))} />
    /
    <input class="month" type="text" value={month} onkeydown={event => onKeyDown(event, 'month')} oninput={e => (month = clampMonth(e.currentTarget.value))} />
    /
    <input class="year" type="text" value={year} onkeydown={event => onKeyDown(event, 'year')} oninput={e => (year = clampYear(e.currentTarget.value))} />
</div>

<style>
    div {
        display: flex;
        align-items: center;
    }
    .day {
        margin-left: 0;
    }
    .year {
        width: 2.25rem;
    }

    input[type='text'] {
        font-size: inherit;
        width: 1.25rem;
        padding: 0;
        border: none;
        background-color: transparent;
        border-radius: 0;

        &:focus,
        &:hover {
            border: none;
        }
    }
</style>
