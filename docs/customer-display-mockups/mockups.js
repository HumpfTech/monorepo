(() => {
	const toast = document.querySelector('[data-mock-toast]');
	let toastTimer;

	function showMockNotice(message) {
		if (!toast) return;
		toast.textContent = message;
		toast.classList.add('visible');
		window.clearTimeout(toastTimer);
		toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2200);
	}

	document.querySelectorAll('button[data-mock-action]').forEach((control) => {
		control.addEventListener('click', (event) => {
			const target = event.currentTarget;
			if (target.classList.contains('switch')) {
				target.classList.toggle('on');
				target.setAttribute('aria-checked', String(target.classList.contains('on')));
				if (target.hasAttribute('data-display-enabled')) {
					const enabled = target.classList.contains('on');
					document.querySelectorAll('[data-display-dependent]').forEach((element) => {
						element.hidden = !enabled;
					});
				}
			}
			showMockNotice(target.dataset.mockMessage || 'Concept control only — no setting was saved.');
		});
	});

	document.querySelectorAll('[data-choice-group]').forEach((group) => {
		const cards = [...group.querySelectorAll('.choice-card')];
		cards.forEach((card) => {
			card.addEventListener('click', () => {
				cards.forEach((candidate) => {
					candidate.classList.toggle('selected', candidate === card);
					candidate.setAttribute('aria-checked', String(candidate === card));
					candidate.tabIndex = candidate === card ? 0 : -1;
				});
				showMockNotice('Layout preview changed locally. This is a future concept.');
			});
			card.addEventListener('keydown', (event) => {
				const currentIndex = cards.indexOf(card);
				const direction = ['ArrowRight', 'ArrowDown'].includes(event.key)
					? 1
					: ['ArrowLeft', 'ArrowUp'].includes(event.key)
						? -1
						: 0;
				let nextIndex = direction ? (currentIndex + direction + cards.length) % cards.length : -1;
				if (event.key === 'Home') nextIndex = 0;
				if (event.key === 'End') nextIndex = cards.length - 1;
				if (nextIndex === -1) return;
				event.preventDefault();
				cards[nextIndex].click();
				cards[nextIndex].focus();
			});
		});
	});

	document.querySelectorAll('select[data-mock-action], input[data-mock-action]').forEach((control) => {
		control.addEventListener('change', () => {
			showMockNotice('Concept control only — no setting was saved.');
		});
	});

	const requestedState = new URLSearchParams(window.location.search).get('state');
	const captureMode = new URLSearchParams(window.location.search).get('capture') === '1';
	if (captureMode) document.body.classList.add('capture-mode');
	const validStates = ['idle', 'cart', 'awaiting-payment'];
	if (captureMode && !validStates.includes(requestedState)) {
		throw new Error('Screenshot capture requires a valid customer-display state.');
	}
	const state = validStates.includes(requestedState) ? requestedState : 'cart';
	if (document.querySelector('[data-state-view]')) {
		document.querySelectorAll('[data-state-view]').forEach((view) => {
			view.hidden = view.dataset.stateView !== state;
		});
		document.title = `${state === 'awaiting-payment' ? 'Awaiting payment' : state[0].toUpperCase() + state.slice(1)} customer display concept — WCPOS`;
	}
	if (state) {
		document.querySelectorAll('[data-state-link]').forEach((link) => {
			const active = link.dataset.stateLink === state;
			link.classList.toggle('active', active);
			if (active) link.setAttribute('aria-current', 'page');
			else link.removeAttribute('aria-current');
		});
	}
	document.querySelector('.rail-link.active')?.scrollIntoView({ inline: 'center', block: 'nearest' });
})();
