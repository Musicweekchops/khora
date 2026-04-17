-- POLICIES FOR PUBLIC BOOKING FLOW
-- These allow anyone to create a booking and the associated classes.

-- 1. Allow public insertion into Booking
DROP POLICY IF EXISTS "Public can insert bookings" ON public."Booking";
CREATE POLICY "Public can insert bookings" ON public."Booking"
  FOR INSERT WITH CHECK (true);

-- 2. Allow public insertion into Class (for public bookings)
DROP POLICY IF EXISTS "Public can insert classes" ON public."Class";
CREATE POLICY "Public can insert classes" ON public."Class"
  FOR INSERT WITH CHECK (true);

-- 3. Allow public to read ClassTypes (needed for selection)
ALTER TABLE public."ClassType" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read class types" ON public."ClassType";
CREATE POLICY "Public can read class types" ON public."ClassType"
  FOR SELECT USING ("isActive" = true);

-- 4. Allow public to check availability (needed for calendar)
ALTER TABLE public."Availability" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read availability" ON public."Availability";
CREATE POLICY "Public can read availability" ON public."Availability"
  FOR SELECT USING ("isActive" = true);

-- 5. Allow public to read exceptions
ALTER TABLE public."AvailabilityException" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read exceptions" ON public."AvailabilityException";
CREATE POLICY "Public can read exceptions" ON public."AvailabilityException"
  FOR SELECT USING (true);
