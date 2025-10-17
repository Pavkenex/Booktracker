# BookTracker Frontend Defense

Ovaj dokument služi kao skripta za prezentaciju frontend dela BookTracker projekta. Sadrži pregled ključnih stranica i funkcionalnosti, objašnjava unutrašnju logiku komponenti i ukazuje na to kako se, gde je relevantno, komunicira sa backend servisima.

## App Shell i infrastruktura

- **Ulazna tačka** je komponenta `AppComponent` (`frontend/src/app/app.ts`) koja renderuje `NavbarComponent` i `RouterOutlet`, čime obezbeđuje navigaciju između stranica.
- **Navigacija i dostupnost podataka**:
  - `NavbarComponent` (`frontend/src/app/components/shared/navbar/navbar.component.ts`) koristi `AsyncPipe` da bi pratio tokove `isAuthenticated$` i `currentUser$` iz `AuthStore`. Na taj način navbar automatski reaguje na promene autentikacije.
  - Padajući meni za profil i odlazne linkove naslanja se na `ClickOutsideDirective` i `FallbackImageDirective` radi UX detalja (zatvaranje pri kliku van menija i placeholder avatari).
- **Globalno rukovanje greškama i tokenima**:
  - `AuthInterceptor` (`frontend/src/app/interceptors/auth-interceptor.ts`) presreće svaku HTTP komunikaciju i ubacuje `Authorization: Bearer` zaglavlje ako postoji token u `AuthStore`.
  - `ErrorInterceptor` (`frontend/src/app/interceptors/error-interceptor.ts`) centralizovano obrađuje greške, poziva servis `ErrorHandler` za prikaz poruka i po potrebi ignoriše pojedine rute koje imaju specifično rukovanje greškama.
  - UI feedback ide preko `ToastNotificationsComponent` (`frontend/src/app/components/shared/toast-notifications/toast-notifications.ts`) koji sluša poruke iz `ErrorHandler` i prikazuje Bootstrap toaste.
- **Servisi**: Većina domen-specifičnih poziva ide preko servisa u `frontend/src/app/services/` (npr. `book-api.ts`, `library-api.ts`, `social-api.ts`), koji enkapsuliraju `HttpClient` pozive prema REST endpointima backend aplikacije.
- **Rute i zaštita**: `app.routes.ts` sadrži deklaracije ruta uz `AuthGuard` i `AdminGuard` koji koriste `AuthStore` da provere prava pristupa.

## Javne stranice

### Home

- **Komponenta**: `HomeComponent` (`frontend/src/app/components/home/home.html` i `.ts`).
- **Glavne sekcije**:
  - Hero sekcija dinamično menja poruku i CTA dugmad u zavisnosti od toga da li je korisnik ulogovan (`isAuthenticated$ | async`).
  - `app-popular-books-section` poziva sopstveni slider za istaknute naslove, koristi `SliderComponent` i asinhrono učitava podatke o popularnim knjigama preko `BookApi`.
  - Blok "Friend Recommendations" se prikazuje samo autenticiranim korisnicima i koristi `RecommendationCardComponent` u `compact` varijanti za poslednje preporuke prijatelja. Akcije "Mark as read", "Add to library" i "Not interested" mapiraju se na metode koje koriste `LibraryApi` i `SocialApi`.
  - Sekcija "Why BookTracker" nudi CTA kartice ka ključnim modulima (katalog, biblioteka, socijalni hub).

### Autentikacija i onboarding

- **Login**: `LoginComponent` (`frontend/src/app/components/auth/login/login.ts` i `.html`) sada koristi template-driven formu (`ngForm`).
  - Validacija se odražava kroz `required` i `minlength` atribute, dok metode `onSubmit(loginForm)` i `isFieldInvalid` osiguravaju prikaz grešaka.
  - Slanjem forme se poziva `AuthStore.login`, čije Observable odgovore komponenta koristi da bi prikazala poruku uspeha, dodelila `returnUrl` ili prikazala greške.
- **Register, Forgot/Reset password**: Ove forme su reactive (`FormBuilder`, `FormGroup`) i nalaze se u `frontend/src/app/components/auth/`. Svaka komponenta koristi `AuthStore` i `ErrorHandler` za backend interakcije i feedback korisniku.

### Book Catalog

- **Komponenta**: `BookCatalogComponent` (`frontend/src/app/components/book/book-catalog`).
- **Struktura**:
  - Levi panel koristi `BookFiltersComponent` za pretragu po naslovu, autoru i žanru, uz podršku za mobilni prikaz putem `MobileFilterToggleComponent`.
  - Glavni deo prikazuje listu knjiga kroz `BookListComponent` (paginacija, empty state, fallback prilikom greške) i `BookPaginationComponent` za kretanje po stranicama.
- **Logika**:
  - `searchParams` objekat čuva trenutne filtere i paginaciju. Svaki put kada se promeni stranica ili veličina stranice, komponenta poziva `bookApi.getBooks` i osvežava `booksResponse` (`PagedResponse<Book>`).
  - `getActiveFiltersCount()` se koristi za prikaz broja uključenih filtera u mobilnom meniju.

### Book Details

- **Komponente**: `BookDetailsComponent` (`frontend/src/app/components/book/book-details`).
  - Layout se sastoji od headera (`BookDetailsHeaderComponent`), sekcije sa akcijama (`BookLibraryActionsComponent`), prikaza sličnih knjiga (`SimilarBooksComponent`) i recenzija (`BookReviewsComponent`).
- **Funkcionalnost**:
  - `addToLibrary`, `removeFromLibrary`, `toggleFavorite` i `statusChanged` metode komuniciraju sa `LibraryApi`, dok `startRecommendation` pravi navigaciju ka social modulu sa predisetovanim query parametrima.
  - `SimilarBooksComponent` reaguje na event `navigateToBook`, vratno poziva `navigateToSimilar` u roditelju radi prelaska na novi ID u ruti.
  - Recenzije se paginiraju pomoću `hasMoreReviews` i `loadMoreReviews()`.

## Privatne stranice korisnika

### Profile

- **Komponenta**: `ProfileComponent` (`frontend/src/app/components/user/profile`).
- **Ključne tačke**:
  - Reactive forma za korisničko ime i email, uz real-time validaciju (`Validators.required`, `Validators.email`, `Validators.maxLength`).
  - `loadProfile()` učitava podatke preko `UserApi.getProfile`, a `handleProfileResponse` osvežava formu i sinhronizuje podatke u `AuthStore` kako bi ostale komponente (npr. navbar) dobile novi avatar/username.
  - Upload avatara koristi `File` API: privremena preview slika se kreira pomoću `URL.createObjectURL`, a po uspešnom upload-u (`userApi.uploadAvatar`) se ili trajno upisuje serverom vraćena URL ili vraća prethodni preview u slučaju greške.
  - Akcija "Reset Password" poziva `authStore.requestPasswordReset` i prikazuje feedback kroz `ErrorHandler` toast poruke.

### My Library

- **Komponente**: `LibraryDashboardComponent`, `LibraryStatsComponent`, `ReviewFormComponent`, `BookStatusSelectorComponent` i dr. Najvažnije elemente pokriva `frontend/src/app/components/library/`.
- **Review workflow**:
  - `ReviewFormComponent` kombinuje reactive formu i ručno upravljanje rating zvezdicama. Slanje forme prikuplja ocenu, opcioni komentar, status čitanja i da li je knjiga favorit, a zatim poziva `LibraryApi.updateUserBook` ili ekvivalent.
  - Modal se prikazuje i zatvara ručno (Bootstrap stil) i emituje ishode ka roditeljskoj komponenti.
- **Statistike**: `LibraryStatsComponent` (često embedovan na dashboardu) preuzima agregirane podatke (`totalBooks`, `readingStreak`, `favouriteGenres`, itd.) i prikazuje state, skeleton loading i empty state poruke.
- **User Library (pregled tuđih polica)**: `UserLibraryComponent` (`frontend/src/app/components/library/user-library/user-library.ts`) učitava knjige prijatelja preko `LibraryApi.getUserLibrary(userId)`, računa statistiku (`calculateStats`) i nudi povratak na listu prijatelja.

## Social Hub

### Pregled i tabovi

- Glavna ruta `/social` kombinuje nekoliko tabova: preporuke, prijatelji i notifikacije.
- `SocialApi` (`frontend/src/app/services/social-api.ts`) je centralno mesto za CRUD nad prijateljstvima, preporukama i notifikacijama. Nakon svake akcije (send, accept, remove) servis poziva `loadNotificationCount` kako bi osvežio badge-ove u navbaru.

### Recommendations

- **Komponenta**: `RecommendationsComponent` (`frontend/src/app/components/social/recommendations`).
- **Funkcionalni tok**:
  - Na inicijalizaciji učitava primljene i poslate preporuke (`socialApi.getRecommendations()` i `getSentRecommendations()`), listu prijatelja i korisničku biblioteku (za izbor knjiga).
  - Sekcija "Send Recommendation" koristi template-driven formu (`#recommendationForm="ngForm"`). Selektovanje knjige kombinuje custom dropdown sa pretragom (`filterBooks()`), dok se friend dropdown osloni na standardni `<select>`.
  - `sendRecommendation()` validira da su izabrani i prijatelj i knjiga, sklapa `SendRecommendationRequest` i oslanja se na RxJS `finalize` da resetuje `isSending` flag.
  - Primljene preporuke se renderuju pomoću `RecommendationCardComponent` sa `variant="detailed"`. Dete komponenta emituje događaje `addToLibrary`, `delete` i `markAsRead`, a roditelj se povezuje sa `LibraryApi` i `SocialApi` da bi zatim osvežio view i notifikacije.

### Friends List

- **Komponenta**: `FriendsListComponent` (`frontend/src/app/components/social/friends-list`).
- **Bitne stavke**:
  - Pretraga prijatelja se debounce-uje (`Subject` + `debounceTime(300)`, `distinctUntilChanged`) da bi se smanjio broj poziva ka `socialApi.searchUsers`.
  - Lista prijatelja prikazuje avatare, quick akcije (pogled biblioteke, preporuka) i menije upravljane kroz `openMenuFriendId` state.
  - Akcije tipa `sendFriendRequest`, `removeFriend` koriste `SocialApi` i po uspehu osvežavaju lokalnu listu.
  - `viewUserLibrary` radi navigaciju na `/library/user/:id/:username`.

### Notifications

- **Komponenta**: `NotificationsComponent` (`frontend/src/app/components/social/notifications`).
- **Opis**:
  - Subscribuje se na `notificationCount$` iz `SocialApi` i prikazuje badge sa ukupnim brojem.
  - Klik na dropdown resetuje broj viđenih notifikacija (`acknowledgedTotal`).
  - Dugmad vode na specifične tabove (prijateljski zahtevi) ili pozivaju `markAllRecommendationsAsRead`.
  - `ClickOutsideDirective` zatvara padajući meni kada korisnik klikne van komponente.

## Admin konzola

### Book Management

- **Komponenta**: `BookManagementComponent` (`frontend/src/app/components/admin/book-management`).
- **Funkcionalnosti**:
  - Gornji filteri koriste `[(ngModel)]` polja (`searchTitle`, `searchAuthor`, `selectedGenreId`) i triggeruju `onSearch()` prilikom unosa.
  - Tabela prikazuje paginirane rezultate (`booksResponse`) i nudi dugmad za izmenu i brisanje.
  - Modal sa formom (`bookForm`, reactive) pokriva unos naslova, autora, godine, thumbnail URL-a, opisa i žanrova (checkbox lista uvezana sa `toggleGenre`).
  - Slanje forme poziva `BookApi` metode (`createBook`, `updateBook`), a brisanje otvara drugi modal za potvrdu.

### Genre Management

- **Komponenta**: `GenreManagementComponent` (`frontend/src/app/components/admin/genre-management`).
  - Filtriranje žanrova `[(ngModel)]="searchTerm"`.
  - Reactive forma `genreForm` za kreiranje/izmenu žanrova.
  - Povezana sa `AdminApi`/`GenreApi` servisima za CRUD operacije.

### Popularity Statistics

- **Komponenta**: `PopularityStatisticsComponent` (`frontend/src/app/components/admin/popularity-statistics`).
  - Obezbeđuje pretragu, sortiranje i limit prikaza top knjiga.
  - Prikazuje grafikone i tabele pomoću agregiranih podataka koje vraća backend (npr. top knjige po broju čitanja, trending žanrovi).
  - UI se oslanja na `ngIf` state-ove za loading i prazne rezultate.

### Reports Panel i ostalo

- Admin deo uključuje rute ka izveštaju o popularnosti, dnevnim aktivnostima i kategorijama (`frontend/backend/src/main/resources/reports`). Frontend komponente u administraciji otvaraju predefinisane JasperReports fajlove preko backend endpointa (npr. klik generiše PDF koje backend vraća kao binarni odgovor).

## Shared komponente i utili

- **Slider ekosistem**: `SliderComponent` + `SliderItemDirective` (`frontend/src/app/components/shared/slider`). Omogućava projekciju templata putem `ngTemplateOutlet` i prilagođenja (breakpointi, broj elemenata po slide-u, custom trackBy).
- **Recommendation Card**: `RecommendationCardComponent` (`frontend/src/app/components/shared/recommendations/`). Konfigurisana preko `@Input` polja (`variant`, `context`, `showDeleteAction`, `showMarkAsRead`), izbacuje `@Output` evente ka roditelju.
- **Direktive**:
  - `ClickOutsideDirective` služi za zatvaranje dropdown-a.
  - `FallbackImageDirective` ubacuje placeholder slike kada `img` ne može da se učita.
- **Constants**: `APP_CONSTANTS` (`frontend/src/app/constants/app.constants.ts`) centralizuje magične vrednosti (npr. slider breakpointi, default avatar).

## Obrasci i validacija

- Projekat koristi oba pristupa:
  - **Reactive forms** na mestima gde je potrebna kompleksnija logika i validacija (profil, admin, recenzije, registracija).
  - **Template-driven** forme za jednostavnije scenarije: npr. `LoginComponent` i deo social preporuka.
- `ErrorHandler.handleValidationErrors` mapira backend validacione greške nazad na forme.

## Komunikacija sa backendom

- Svi HTTP pozivi idu preko servisa (`BookApi`, `LibraryApi`, `SocialApi`, `UserApi`, `AdminApi`).
- Servisi koriste `ApiClient` (`frontend/src/app/services/api-client.ts`) koji standardizuje bazni URL, dodaje common zaglavlja i centralizuje error handling.
- Observables se kombinuju sa RxJS operatorima (`map`, `tap`, `finalize`, `takeUntil`) da bi se upravljalo loading state-om, otkazivanjem poziva na `ngOnDestroy` i osvežavanjem UI-ja.
- Token i refresh logika su enkapsulisani u `AuthStore`. Nakon uspešne autentikacije, `authStore.setSession` čuva token i podatke u `localStorage`, što omogućava da se stanje obnavi na reload-u.

## UX i stilizacija

- Dizajn kombinuje Bootstrap 5 util klase i custom SCSS fajlove (`styles.scss`, pojedinačni `.css` fajlovi uz komponente).
- Većina komponenti sadrži skeleton/loader stanja (`spinner-border`, placeholder badge-ovi) i empty state blokove sa ikonama.
- `Breakpoint` logika u slideru i filterima omogućava responzivan prikaz.

## Testovi i proveravanje kvaliteta

- Projekat uključuje minimalne unit testove (`slider.util.spec.ts`). Tamo se testiraju util funkcije kao što su kalkulacije za slider (broj elemenata po slide-u, izrada grupa).
- `package.json` sadrži skripte za build (`ng build`) i test (`ng test`).

## Zaključak

Frontend BookTracker-a pokriva kompletnu korisničku priču: od javnog kataloga i autentikacije, preko personalizovane biblioteke i socijalnih interakcija, do admin alata za održavanje kataloga. Svaka viša stranica modularizovana je u zasebne komponente i servise, dok interceptori, direktive i shared komponente obezbeđuju dosledan UX. Pri prezentaciji možete pratiti redosled iz ovog dokumenta i naglasiti kako se svaki segment oslanja na Angular funkcionalnosti (routing, forme, RxJS) i kako koordinira sa backend REST API-jem.
